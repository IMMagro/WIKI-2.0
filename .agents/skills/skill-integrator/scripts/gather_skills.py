import os
import re
import json

def get_skills(base_dir=".agents/skills"):
    skills = []
    if not os.path.exists(base_dir):
        return skills
    
    for item in os.listdir(base_dir):
        skill_dir = os.path.join(base_dir, item)
        if os.path.isdir(skill_dir):
            for file in os.listdir(skill_dir):
                if file.endswith(".md"):
                    file_path = os.path.join(skill_dir, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    # Extract frontmatter
                    match = re.search(r'^---\s*(.*?)\s*---', content, re.DOTALL)
                    if match:
                        frontmatter = match.group(1)
                        name_match = re.search(r'^name:\s*(.+)$', frontmatter, re.MULTILINE)
                        desc_match = re.search(r'^description:\s*(.+)$', frontmatter, re.MULTILINE)
                        
                        if name_match:
                            skills.append({
                                "name": name_match.group(1).strip(),
                                "description": desc_match.group(1).strip() if desc_match else "No description",
                                "path": file_path
                            })
                            break # Found the skill file, move to next directory
    return skills

if __name__ == "__main__":
    skills = get_skills()
    print(json.dumps(skills, indent=2))
