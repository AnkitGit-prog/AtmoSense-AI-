import docx
import os

def replace_names_in_doc(doc_path, new_doc_path):
    if not os.path.exists(doc_path):
        print(f"Error: Could not find {doc_path}.")
        return

    doc = docx.Document(doc_path)
    
    replacements = {
        "Piyush Solanki (EN23CS304044)": "Ankit Tiwari (EN3CS301141)",
        "Mayank Sahu (EN23CS304037)": "Ansh Goyel (EN23CS301100)",
        "Piyush Pal (EN23CS304044)": "Aniket Soni (EN23CS301132)",
        "Piyush Solanki (EN3CS304045)": "Ankit Tiwari (EN3CS301141)",
        "Piyush Solanki": "Ankit Tiwari",
        "Mayank Sahu": "Ansh Goyel",
        "Piyush Pal": "Aniket Soni"
    }

    for p in doc.paragraphs:
        for old, new in replacements.items():
            if old in p.text:
                # We replace inline to keep formatting as much as possible
                for run in p.runs:
                    if old in run.text:
                        run.text = run.text.replace(old, new)
                # If run replacement didn't catch it (due to splits), replace full text
                if old in p.text:
                    p.text = p.text.replace(old, new)

    doc.save(new_doc_path)
    print(f"Updated names saved to {new_doc_path}")

if __name__ == '__main__':
    replace_names_in_doc(r'Report\AtmoSense_Final_Project_Report.docx', r'Report\AtmoSense_Final_Project_Report_Updated_Names.docx')
    replace_names_in_doc(r'Report\AtmoSense_Front_Pages.docx', r'Report\AtmoSense_Front_Pages_Updated_Names.docx')
