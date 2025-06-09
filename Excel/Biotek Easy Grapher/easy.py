import win32com.client
import os
import time
from tkinter import Tk
from tkinter.filedialog import askopenfilename
from tkinter import messagebox

Tk().withdraw()

messagebox.showinfo(
        "Pause",
        "Please close the excel spreadsheet you wish to modify\n"
        "Then press OK to continue"
    )

xlsx_path = askopenfilename(
    title="Select Excel file",
    filetypes=[("Excel files", "*.xlsx *.xlsm *.xlsb *.xls")]
)

if not xlsx_path:
    print("No file selected. Exiting.")
    exit()

base, _ = os.path.splitext(xlsx_path)
xlsm_path = base + ".xlsm"
macro_name = "PlotData"

# Ask user to select the .bas macro file
macro_bas_path = askopenfilename(
    title="Select Macro (.bas) file to import",
    filetypes=[("VB Modules", "*.bas")]
)

# Check if user canceled
if not macro_bas_path:
    print("No macro file selected. Exiting.")
    exit()

# Print full path for confirmation
print(f"Macro file selected: {macro_bas_path}")

if not os.path.isfile(macro_bas_path):
    print(f"Macro file not found: {macro_bas_path}")
    exit(1)

vbext_ct_StdModule = 1

excel = win32com.client.gencache.EnsureDispatch("Excel.Application")
excel.Visible = True

try:
    xlsx_path = os.path.normpath(xlsx_path)
    xlsm_path = os.path.normpath(xlsm_path)

    print(f"Opening XLSX file: {xlsx_path}")
    wb = excel.Workbooks.Open(xlsx_path)

    print(f"Saving as XLSM: {xlsm_path}")
    xlOpenXMLWorkbookMacroEnabled = 52
    wb.SaveAs(xlsm_path, FileFormat=xlOpenXMLWorkbookMacroEnabled)
    wb.Close(SaveChanges=True)

    messagebox.showinfo(
        "Pause",
        "1. Open your new .xlsm Excel macro-enabled spreadsheet\n"
        "2. Go to Developer → Macro Security\n"
        "3. Check the box Trust access to the VBA project object model AND \"enable all macros\".\n"
        "4. Save with Ctrl+S\n"
        "5. Close Excel.\n"
        "Then click OK to continue."
    )

    print(f"Reopening XLSM to inject macro...")
    wb = excel.Workbooks.Open(xlsm_path)

    print(f"Importing macro from {macro_bas_path}...")
    vbproj = wb.VBProject
    vbcomp = vbproj.VBComponents.Add(1)  
    vbcomp.Name = "PlotData"              
    vbcomp.CodeModule.AddFromFile(macro_bas_path)
    excel.Application.OnKey("^p", "PlotData")

    print("Saving workbook with macro...")
    wb.Save()

    print("Done!")

    messagebox.showinfo(
        "Pause",
        "To run the new macro in your new .xlsm spreadsheet,\n"
        "1. Go to Developer → Macros\n"
        "2. Select the macro with \"PlotData\" in the name\n"
        "3. Click \"Run\"\n"
        "Click OK to continue..."
    )

except Exception as e:
    print("Error:", e)
