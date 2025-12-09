import urllib.request
import urllib.error

urls = [
    "https://mybid.com.br/mentoria-trilha-do-arrematante"
]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

for url in urls:
    try:
        print(f"Trying {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print(f"Success! Saving to temp_mentoria.html")
            with open("temp_mentoria.html", "w", encoding="utf-8") as f:
                f.write(content)
            break
    except urllib.error.HTTPError as e:
        print(f"Failed with {e.code}")
    except Exception as e:
        print(f"Error: {e}")
