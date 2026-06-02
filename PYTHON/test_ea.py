import pymysql, os, sys, json
sys.stdout.reconfigure(encoding='utf-8')
from dotenv import load_dotenv
load_dotenv()
conn = pymysql.connect(
    host=os.getenv('DB_HOST', '187.127.131.38'),
    port=int(os.getenv('DB_PORT', '3308')),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD'),
    database='windmill'
)
cursor = conn.cursor(pymysql.cursors.DictCursor)

year = 2026
mode = 'financial'

# 1. Fetch main banking utilized records via stored procedure
cursor.callproc('sp_get_banking_utilized', (year, mode))
rows = cursor.fetchall()

# 4. Fetch Energy Allotment "Utilized Bank" totals per windmill/year/month/slot
ea_query = '''
    SELECT 
        mw.windmill_number,
        h.year,
        h.month,
        COALESCE(SUM(CASE WHEN d.slot='c1' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c1,
        COALESCE(SUM(CASE WHEN d.slot='c2' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c2,
        COALESCE(SUM(CASE WHEN d.slot='c4' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c4,
        COALESCE(SUM(CASE WHEN d.slot='c5' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c5
    FROM windmill.energy_allotment_header h
    JOIN windmill.energy_allotment_details d ON h.allocation_id = d.allocation_id
    JOIN masters.master_windmill mw ON h.windmill_id = mw.id
    WHERE h.status = '1' AND d.status = '1'
      AND LOWER(mw.type) = 'windmill'
      AND (
        (%(mode)s = 'financial' AND ((h.year = %(year)s AND h.month >= 4) OR (h.year = %(year)s + 1 AND h.month <= 3)))
        OR
        (%(mode)s = 'calendar' AND h.year = %(year)s)
      )
    GROUP BY mw.windmill_number, h.year, h.month
'''
cursor.execute(ea_query, {'year': year, 'mode': mode})
ea_rows = cursor.fetchall()

ea_lookup = {}
for ea in ea_rows:
    ea_key = f"{str(ea['windmill_number']).strip()}-{ea['year']}-{ea['month']}"
    ea_lookup[ea_key] = ea

for r in rows:
    wm_num = str(r.get('windmill_number') or '').strip()
    ea_key = f"{wm_num}-{r.get('year')}-{r.get('month')}"
    ea_data = ea_lookup.get(ea_key, {})
    if ea_data:
        print(f"Found match for {ea_key}: {ea_data['ea_bank_c1']}")

cursor.close()
conn.close()
