import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the kits dashboard.
    page.goto("http://localhost:3000/dashboard/kits")

    # Click the "New Kit" button to open the modal.
    page.get_by_role("button", name="New Kit").click()

    # Wait for the modal to appear and check the title.
    modal_title = page.get_by_role("heading", name="Create New Kit")
    expect(modal_title).to_be_visible()

    # Fill out the kit details in the modal.
    page.get_by_label("Kit Name").fill("My Modal Test Kit")
    page.get_by_label("Description").fill("A test kit created from the modal.")

    # Select a category.
    page.get_by_label("Category").click()
    page.get_by_text("First-Aid Kit").click()

    # Click the save button in the modal footer.
    page.get_by_role("button", name="Save Kit").click()

    # Wait for the modal to disappear.
    expect(modal_title).not_to_be_visible()

    # Verify that the new kit appears on the dashboard.
    new_kit_card = page.get_by_role("heading", name="My Modal Test Kit")
    expect(new_kit_card).to_be_visible()

    # Take a screenshot for verification.
    page.screenshot(path="jules-scratch/verification/kit_modal_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)