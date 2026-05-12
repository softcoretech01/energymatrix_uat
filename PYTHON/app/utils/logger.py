from typing import Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import json
import logging
import os
import decimal
import datetime
from app.database import get_connection

LOG_FILE = "audit_debug.log"

class AuditJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return str(obj)
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()
        return super().default(obj)

logger = logging.getLogger(__name__)

def log_audit(
    db: Any,
    user_id: int,
    action_type: str,
    module_name: str,
    entity_id: Optional[int] = None,
    details: Optional[dict] = None,
    ip_address: Optional[str] = None,
    page_name: Optional[str] = None,
    changed_from: Optional[dict] = None,
    changed_to: Optional[dict] = None,
    schema: str = "masters"
):
    """
    Utility function to insert an audit log using stored procedure.
    Always uses an independent connection to ensure the log is committed
    regardless of the caller's transaction state.

    Args:
        db           : Caller's db connection (not used directly, kept for signature compat).
        user_id      : ID of the user who performed the action.
        action_type  : CREATE | UPDATE | DELETE | SAVE | UPLOAD | etc.
        module_name  : Logical module (e.g. "Customer", "Customer_SE").
        entity_id    : Primary key of the affected record.
        details      : Arbitrary dict of relevant field values at the time of the action.
        ip_address   : Client IP.
        page_name    : UI page/tab where the action was performed (e.g. "Customer Master",
                       "Customer Agreed Units", "Energy Allotment").
        changed_from : Dict of field values BEFORE the change (for UPDATE actions).
        changed_to   : Dict of field values AFTER the change (for UPDATE actions).
        schema       : Database schema name.
    """
    try:
        details_json      = json.dumps(details, cls=AuditJSONEncoder)      if details      else None
        changed_from_json = json.dumps(changed_from, cls=AuditJSONEncoder) if changed_from else None
        changed_to_json   = json.dumps(changed_to, cls=AuditJSONEncoder)   if changed_to   else None

        # 1. Map module_name to specific audit table
        table_mapping = {
            # Masters
            "Customer":             "audit_master_customers",
            "Customer_SE":          "audit_customer_service",
            "Customer_Contact":     "audit_master_customers", # Grouped with customer
            "Customer_Docs":        "audit_master_customers", # Grouped with customer
            "Customer_Agreed_Units":"audit_customer_agreed_units",
            "Customer_Share":       "audit_customer_shares",
            "Windmill_Master":      "audit_master_windmill",
            "Investor":             "audit_master_investors",
            "EDC_Circle":           "audit_master_edc_circle",
            "User":                 "audit_master_users",
            "Charge_Master":        "audit_master_charges",
            "Consumption_Charge":   "audit_consumption_charges",
            "Total_Shares":         "audit_total_shares",
            
            # Windmill
            "EB_Statement":         "audit_eb_statements",
            "EB_Bill":              "audit_eb_bills",
            "EB_Bill_PDF":          "audit_eb_bills",
            "EB_Bill_Detail":       "audit_eb_bills",
            "DailyGeneration":      "audit_windmill_daily_transaction",
            "Energy_Allotment":     "audit_energy_allotments",
            "Energy_Balance":       "audit_energy_balances",
            "Charge_Allotment":     "audit_charge_allotments",
            "Solar_Allotment":      "audit_charge_allotments", 
            "Allotment_Order":      "audit_eb_statements",
            "Charge_Calculation":   "audit_eb_statements",
            "Charge_Comparison":    "audit_eb_statements",
            
            # Solar
            "Solar_Charge_Calculation": "audit_eb_statement_solar",
            "Solar_Charge_Comparison":    "audit_eb_statement_solar",
        }
        
        target_table = table_mapping.get(module_name, "audit_logs")
        
        # 2. Use independent connection
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        
        try:
            # 3. Call stored procedure
            # Since SP is generic, we can either make it dynamic or just insert directly
            # For "separate tables", we insert directly to ensure we hit the right table
            query = f"""
                INSERT INTO {schema}.{target_table} (
                    user_id, action_type, module_name, entity_id, 
                    details, ip_address, page_name, changed_from, changed_to
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                user_id,
                action_type,
                module_name,
                entity_id,
                details_json,
                ip_address,
                page_name,
                changed_from_json,
                changed_to_json
            ))
            conn.commit()
            cursor.close()
            success_msg = f"[AUDIT] Logged: action={action_type}, module={module_name}, table={target_table}, user={user_id}"
            print(success_msg)
            with open(LOG_FILE, "a") as f:
                f.write(f"{success_msg}\n")
        finally:
            conn.close()

    except Exception as e:
        error_msg = f"[AUDIT ERROR] Failed to create audit log: {e}"
        print(error_msg)
        logger.error(error_msg)

def log_error(
    user_id: Optional[int] = None,
    page_name: Optional[str] = None,
    module_name: Optional[str] = None,
    error_message: str = "",
    error_stack: Optional[str] = None,
    endpoint: Optional[str] = None,
    method: Optional[str] = None,
    browser_info: Optional[str] = None,
    ip_address: Optional[str] = None,
    schema: str = "masters"
):
    """
    Utility function to insert an error log into the database.
    Uses an independent connection to ensure the log is committed.
    """
    try:
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        
        try:
            query = f"""
                INSERT INTO {schema}.error_logs (
                    user_id, page_name, module_name, error_message, 
                    error_stack, endpoint, method, browser_info, ip_address
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                user_id,
                page_name,
                module_name,
                error_message,
                error_stack,
                endpoint,
                method,
                browser_info,
                ip_address
            ))
            conn.commit()
            cursor.close()
            print(f"[ERROR LOGGED] module={module_name}, msg={error_message[:100]}")
        finally:
            conn.close()

    except Exception as e:
        print(f"[CRITICAL] Failed to create error log: {e}")
        logger.error(f"Failed to create error log: {e}")
def log_login(
    user_id: int,
    user_name: str,
    ip_address: Optional[str] = None,
    browser_info: Optional[str] = None,
    status: str = "SUCCESS",
    fail_reason: Optional[str] = None,
    schema: str = "masters"
):
    """Logs a single login event."""
    try:
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        try:
            cursor.execute(
                f"INSERT INTO {schema}.login_logs (user_id, user_name, ip_address, browser_info, login_status, fail_reason) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, user_name, ip_address, browser_info, status, fail_reason)
            )
            conn.commit()
            cursor.close()
        finally:
            conn.close()
    except Exception as e:
        print(f"Failed to log login: {e}")

def log_logout(
    user_id: int,
    user_name: str,
    ip_address: Optional[str] = None,
    logout_type: str = "MANUAL",
    schema: str = "masters"
):
    """Logs a single logout event."""
    try:
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        try:
            cursor.execute(
                f"INSERT INTO {schema}.logout_logs (user_id, user_name, ip_address, logout_type) VALUES (%s, %s, %s, %s)",
                (user_id, user_name, ip_address, logout_type)
            )
            conn.commit()
            cursor.close()
        finally:
            conn.close()
    except Exception as e:
        print(f"Failed to log logout: {e}")


def log_session_login(
    user_id: int,
    user_name: str,
    ip_address: Optional[str] = None,
    browser_info: Optional[str] = None,
    schema: str = "masters"
) -> Optional[int]:
    """
    Insert a LOGIN record into masters.user_sessions.
    Returns the new session_id so it can be stored in the JWT / returned to the frontend.
    """
    try:
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        try:
            cursor.execute(
                f"""INSERT INTO {schema}.user_sessions
                       (user_id, user_name, ip_address, browser_info, status)
                    VALUES (%s, %s, %s, %s, 'ACTIVE')""",
                (user_id, user_name, ip_address, browser_info)
            )
            session_id = cursor.lastrowid
            conn.commit()
            cursor.close()
            print(f"[SESSION] LOGIN recorded: user={user_name}, session_id={session_id}")
            return session_id
        finally:
            conn.close()
    except Exception as e:
        print(f"[CRITICAL] Failed to log session login: {e}")
        logger.error(f"Failed to log session login: {e}")
        return None


def log_session_logout(
    session_id: Optional[int] = None,
    user_id: Optional[int] = None,
    schema: str = "masters"
):
    """
    Mark an existing session as LOGGED_OUT.
    Matches by session_id if provided, otherwise closes the latest ACTIVE session for user_id.
    """
    try:
        conn = get_connection(db_name=schema)
        cursor = conn.cursor()
        try:
            if session_id:
                cursor.execute(
                    f"""UPDATE {schema}.user_sessions
                           SET logout_time = NOW(), status = 'LOGGED_OUT'
                         WHERE id = %s""",
                    (session_id,)
                )
            elif user_id:
                cursor.execute(
                    f"""UPDATE {schema}.user_sessions
                           SET logout_time = NOW(), status = 'LOGGED_OUT'
                         WHERE user_id = %s AND status = 'ACTIVE'
                         ORDER BY login_time DESC
                         LIMIT 1""",
                    (user_id,)
                )
            conn.commit()
            cursor.close()
            print(f"[SESSION] LOGOUT recorded: session_id={session_id}, user_id={user_id}")
        finally:
            conn.close()
    except Exception as e:
        print(f"[CRITICAL] Failed to log session logout: {e}")
        logger.error(f"Failed to log session logout: {e}")
