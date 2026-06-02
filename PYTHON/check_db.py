import pymysql, os
from dotenv import load_dotenv
load_dotenv()

host = os.getenv('DB_HOST', '187.127.131.38')
port = int(os.getenv('DB_PORT', '3306'))
user = os.getenv('DB_USER', 'root')
password = os.getenv('DB_PASSWORD', 'Ener9y#8154')

# Check stored procedures in windmill DB
conn = pymysql.connect(host=host, port=port, user=user, password=password, database='windmill', connect_timeout=10, cursorclass=pymysql.cursors.DictCursor)
cursor = conn.cursor()
cursor.execute("SHOW PROCEDURE STATUS WHERE Db = 'windmill'")
sps = cursor.fetchall()
print("=== Stored Procedures in windmill DB ===")
for sp in sps:
    print(f"  {sp['Name']}")

# Check stored procedures in masters DB
conn2 = pymysql.connect(host=host, port=port, user=user, password=password, database='masters', connect_timeout=10, cursorclass=pymysql.cursors.DictCursor)
cursor2 = conn2.cursor()
cursor2.execute("SHOW PROCEDURE STATUS WHERE Db = 'masters'")
sps2 = cursor2.fetchall()
print("\n=== Stored Procedures in masters DB ===")
for sp in sps2:
    print(f"  {sp['Name']}")

# Test the sp directly
print("\n=== Testing sp_get_eb_statement_list ===")
try:
    cursor.callproc("sp_get_eb_statement_list", (None, None, None))
    rows = cursor.fetchall()
    print(f"Returned {len(rows)} rows")
    if rows:
        print("First row:", rows[0])
except Exception as e:
    print(f"ERROR: {e}")

# Test windmill dropdown sp
print("\n=== Testing sp_get_windmill_dropdown_standard ===")
try:
    cursor2.callproc("sp_get_windmill_dropdown_standard")
    rows2 = cursor2.fetchall()
    print(f"Returned {len(rows2)} rows")
    if rows2:
        print("First row:", rows2[0])
except Exception as e:
    print(f"ERROR: {e}")

conn.close()
conn2.close()
print("Done.")
