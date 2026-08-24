import sys

with open(r'C:\Users\massimiliano.magrini\.gemini\antigravity-ide\brain\2ac1703b-c0e7-43eb-8a32-ab1d8f9a3fad\.system_generated\tasks\task-1064.log', 'r', encoding='utf-16') as f:
    try:
        lines = f.readlines()
    except UnicodeDecodeError:
        with open(r'C:\Users\massimiliano.magrini\.gemini\antigravity-ide\brain\2ac1703b-c0e7-43eb-8a32-ab1d8f9a3fad\.system_generated\tasks\task-1064.log', 'r', encoding='utf-8') as f:
            lines = f.readlines()

diff_lines = []
in_diff = False
for line in lines:
    if line.startswith('diff --git'):
        in_diff = True
    if in_diff:
        diff_lines.append(line)

with open('recover.diff', 'w', encoding='utf-8') as f:
    f.writelines(diff_lines)
