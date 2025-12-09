from bs4 import BeautifulSoup

def inspect_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    body = soup.body

    if not body:
        print("No body tag found!")
        return

    print("--- Body Children Structure ---")
    for child in body.children:
        if child.name:
            print(f"Tag: {child.name}, Classes: {child.get('class', [])}")
            # If it's a section or main container, look deeper
            if child.name in ['section', 'div', 'main']:
                print(f"  > Inside {child.name}:")
                for subchild in child.find_all(['h1', 'h2', 'h3', 'img', 'p', 'a'], recursive=False):
                     print(f"    - {subchild.name}: {subchild.get_text(strip=True)[:50]}...")
                
                # Check for nested sections or containers if top level is wrapper
                sections = child.find_all('section')
                if sections:
                    print(f"    - Found {len(sections)} nested sections")
                    for i, sec in enumerate(sections[:5]): # Show first 5
                        print(f"      Section {i+1}: Classes: {sec.get('class', [])}")
                        # Print first few headers in section to identify it
                        headers = sec.find_all(['h1', 'h2', 'h3'])
                        for h in headers[:2]:
                            print(f"        Header: {h.get_text(strip=True)}")

if __name__ == "__main__":
    inspect_html('temp_cursoadv.html')
