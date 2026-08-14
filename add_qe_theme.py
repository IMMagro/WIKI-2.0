from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
import os

# Create a new PDF page for the theme
temp_pdf = "temp_theme.pdf"
c = canvas.Canvas(temp_pdf, pagesize=letter)
width, height = letter

# Draw Theme Info
c.setFont("Helvetica-Bold", 24)
c.drawString(50, height - 80, "12. Quaderno Elettronico Theme")

c.setFont("Helvetica", 12)
c.drawString(50, height - 120, "Description: Clean, modern corporate theme extracted from quadernoelettronico.it,")
c.drawString(50, height - 140, "featuring primary blue accents and soft neutral backgrounds.")

# Draw Colors
c.setFont("Helvetica-Bold", 16)
c.drawString(50, height - 180, "Colors:")
c.setFont("Helvetica", 12)

colors = [
    ("Primary Background", "#F8FAFD"),
    ("Secondary Background", "#FFFFFF"),
    ("Primary Text", "#1E2022"),
    ("Secondary Text", "#77838F"),
    ("Primary Accent", "#377DFF"),
    ("Secondary Accent", "#F80086")
]

y = height - 210
for name, hexcode in colors:
    # Draw color box
    c.setFillColor(hexcode)
    # Give a border if it's white to see it
    if hexcode in ["#FFFFFF", "#F8FAFD"]:
        c.setStrokeColor("#CCCCCC")
        c.rect(50, y - 10, 30, 20, fill=1, stroke=1)
    else:
        c.rect(50, y - 10, 30, 20, fill=1, stroke=0)
    
    c.setFillColor("#000000")
    c.drawString(90, y - 5, f"{name}: {hexcode}")
    y -= 30

# Draw Fonts
c.setFont("Helvetica-Bold", 16)
c.drawString(50, y - 20, "Fonts:")
c.setFont("Helvetica", 12)
c.drawString(50, y - 45, "Headers: Poppins")
c.drawString(50, y - 65, "Body: Poppins")

c.save()

# Append to showcase
showcase_path = r"C:\Users\massimiliano.magrini\Desktop\Wiki 2.0\.agents\skills\theme-factory\theme-showcase.pdf"

# If showcase doesn't exist, we'll just rename temp_theme.pdf to it. But it should exist.
if os.path.exists(showcase_path):
    writer = PdfWriter()
    reader = PdfReader(showcase_path)
    for page in reader.pages:
        writer.add_page(page)
    
    new_page_reader = PdfReader(temp_pdf)
    writer.add_page(new_page_reader.pages[0])
    
    with open(showcase_path, "wb") as output:
        writer.write(output)
    
    os.remove(temp_pdf)
    print("Theme showcase updated successfully.")
else:
    print(f"Showcase PDF not found at {showcase_path}!")
