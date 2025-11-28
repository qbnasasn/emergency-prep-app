import os
from playwright.sync_api import sync_playwright

def test_sanity(page):
    page.add_init_script("Object.defineProperty(navigator, 'usb', { value: {} });")

    print("Navigating...")
    try:
        page.goto("http://localhost:3000/verify-rtlsdr", timeout=60000)
    except Exception as e:
        print(f"Navigation failed: {e}")
        return

    print("Waiting for component...")
    page.wait_for_selector("text=RTL-SDR Receiver", timeout=30000)
    print("Component rendered.")

    # Screenshot
    print("Taking screenshot.")
    if not os.path.exists("verification"):
        os.makedirs("verification")
    page.screenshot(path="verification/sanity.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_sanity(page)
        except Exception as e:
            print(f"Error: {e}")
            raise
        finally:
            browser.close()
