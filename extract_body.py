
from bs4 import BeautifulSoup

try:
    with open('temp_mybid.html', 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    body = soup.body

    if body:
        # Prettify the body content to make it readable
        pretty_body = body.prettify()
        
        with open('temp_body.html', 'w', encoding='utf-8') as f:
            f.write(pretty_body)
        print("Successfully extracted body to temp_body.html")
    else:
        print("No body tag found")

except Exception as e:
    print(f"Error: {e}")
