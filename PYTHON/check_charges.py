import pymysql
import json

def get_connection():
    return pymysql.connect(
        host="187.127.131.38",
        user="root",
        password="Ener9y#8154",
        database="windmill"
    )

def query_charges():
    conn = get_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        query = """
            SELECT 
                TRIM(mw.windmill_number) as windmill_number,
                mcc.charge_code,
                mcc.charge_name,
                ac.total_charge
            FROM windmill.eb_statements s
            JOIN windmill.eb_statements_applicable_charges ac ON s.id = ac.eb_header_id
            JOIN masters.master_consumption_chargers mcc ON ac.charge_id = mcc.id
            JOIN masters.master_windmill mw ON s.windmill_id = mw.id
            WHERE s.month = 'February' AND s.year = 2026
            AND mw.windmill_number IN ('039214391145', '039214391188', '039224391344')
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        for row in rows:
            print(f"WM: {row['windmill_number']}, Code: {row['charge_code']}, Name: {row['charge_name']}, Val: {row['total_charge']}")
    finally:
        conn.close()

if __name__ == "__main__":
    query_charges()
