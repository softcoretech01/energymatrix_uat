import pymysql
import json

def get_connection():
    return pymysql.connect(
        host="187.127.131.38",
        user="root",
        password="Ener9y#8154",
        database="windmill"
    )

def query_saved_allotments():
    conn = get_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        query = """
            SELECT 
                mw.windmill_number,
                mc.customer_name,
                cs.service_number,
                mcc.charge_code,
                d.charge_amount
            FROM windmill.charge_allotment_header h
            JOIN windmill.charge_allotment_details d ON h.id = d.header_id
            JOIN masters.master_windmill mw ON h.windmill_id = mw.id
            JOIN masters.master_customers mc ON h.customer_id = mc.id
            JOIN masters.customer_service cs ON h.service_id = cs.id
            JOIN masters.master_consumption_chargers mcc ON d.charge_id = mcc.id
            WHERE h.month = 2 AND h.year = 2026
            AND mw.windmill_number = '039214391145'
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        for row in rows:
            print(f"WM: {row['windmill_number']}, Cust: {row['customer_name']}, Code: {row['charge_code']}, Val: {row['charge_amount']}")
    finally:
        conn.close()

if __name__ == "__main__":
    query_saved_allotments()
