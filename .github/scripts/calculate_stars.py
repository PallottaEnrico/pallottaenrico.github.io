import os
import json
from github import Github, Auth

auth = Auth.Token(os.getenv('GH_TOKEN'))
g = Github(auth=auth)

username = "PallottaEnrico"
user = g.get_user(username)

total_stars = sum(repo.stargazers_count for repo in user.get_repos())

try:
    external_repos_path = 'config/external_repos.json'
    if os.path.exists(external_repos_path):
        with open(external_repos_path, 'r') as f:
            external_repos = json.load(f)

        for repo_name in external_repos:
            repo = g.get_repo(repo_name)
            total_stars += repo.stargazers_count
except Exception as e:
    print(f"Error reading external repos: {e}")

display_count = f"{total_stars/1000:.1f}k" if total_stars >= 1000 else str(total_stars)

data = {
    "schemaVersion": 1,
    "label": "⭐ Stars",
    "message": display_count,
    "color": "FFD700",
    "style": "for-the-badge"
}

with open('stars_data.json', 'w') as f:
    json.dump(data, f)

print(f"Total stars: {total_stars} (displayed as: {display_count})")
