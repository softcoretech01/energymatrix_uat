import pdfplumber
import json

pdf_path = r"d:\DOWNLOADS\energymatrix_uat\Docs\Feb -526.pdf"

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"--- Page {i+1} ---")
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1}:")
            for row in table:
                print(row)
        
        # Also print text for fallback check
        print(f"--- Text Page {i+1} ---")
        print(page.extract_text())
