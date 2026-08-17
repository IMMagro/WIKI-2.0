import sys

with open(r"c:\Users\massimiliano.magrini\Desktop\Wiki 2.0\src\app\app.component.html", "r", encoding="utf-8") as f:
    content = f.read()

parts = []
head_marker = "<<<<<<< HEAD"
mid_marker = "======="
tail_marker = ">>>>>>> origin/main"

while head_marker in content:
    pre, rest = content.split(head_marker, 1)
    parts.append(pre)
    conflict, content = rest.split(tail_marker, 1)
    head_content, remote_content = conflict.split(mid_marker, 1)
    
    # Decide which one to keep
    # Conflict 1: Sfondo Aurora
    if "pointer-events-none absolute inset-0 opacity-40 dark:opacity-30" in head_content:
        parts.append(remote_content.lstrip('\n'))
    # Conflict 2: Sidebar vs Main Content
    elif "<!-- Sidebar -->" in head_content:
        parts.append(remote_content.lstrip('\n'))
    # Conflict 3: Backdrop per chiudere il menu
    elif "<!-- Backdrop per chiudere il menu cliccando fuori -->" in head_content:
        # We want to keep the origin/main button
        parts.append(remote_content.lstrip('\n'))
    # Conflict 4: Popover Card
    elif "<!-- Popover Card (Glassmorphism) -->" in head_content:
        # We want to keep HEAD's popover
        parts.append(head_content.lstrip('\n'))
    # Conflict 5: Hero vs Dynamic Content Area
    elif "<!-- Hero -->" in head_content:
        parts.append(remote_content.lstrip('\n'))
    # Conflict 6: Footer
    elif "<footer" in head_content:
        parts.append(head_content.lstrip('\n'))
    # Conflict 7: Closing tags & Minimalist Sidebar
    elif "<!-- Sidebar Minimalista" in remote_content:
        parts.append(remote_content.lstrip('\n'))
    else:
        print("UNKNOWN CONFLICT:")
        print(head_content[:100])
        sys.exit(1)

parts.append(content)

with open(r"c:\Users\massimiliano.magrini\Desktop\Wiki 2.0\src\app\app.component.html", "w", encoding="utf-8") as f:
    f.write("".join(parts))

print("Merged successfully.")
