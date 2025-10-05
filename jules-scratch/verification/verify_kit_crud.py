import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the kits dashboard.
    page.goto("http://localhost:3000/dashboard/kits")

    # --- CREATE ---
    # Click "New Kit" to open the modal.
    page.get_by_role("button", name="New Kit").click()
    expect(page.get_by_role("heading", name="Create New Kit")).to_be_visible()

    # Fill out the form.
    page.get_by_label("Kit Name").fill("CRUD Test Kit")
    page.get_by_label("Description").fill("Initial Description")
    page.get_by_label("Category").click()
    page.get_by_text("Custom Kit").click()
    page.get_by_role("button", name="Save Kit").click()

    # --- READ ---
    # Verify the new kit appears on the dashboard.
    new_kit_card = page.locator("div.card", has_text="CRUD Test Kit")
    expect(new_kit_card).to_be_visible()
    expect(new_kit_card.get_by_text("Initial Description")).to_be_visible()

    # --- UPDATE ---
    # Click the "Edit" button on the new kit.
    new_kit_card.get_by_role("button").filter(has_text=re.compile(r"Edit", re.I)).click()
    expect(page.get_by_role("heading", name="Edit Kit")).to_be_visible()

    # Change the description.
    page.get_by_label("Description").fill("Updated Description")
    page.get_by_role("button", name="Save Kit").click()

    # Verify the description was updated on the card.
    expect(new_kit_card.get_by_text("Updated Description")).to_be_visible()

    # --- DELETE ---
    # Click the "Delete" button.
    new_kit_card.get_by_role("button").filter(has_text=re.compile(r"Trash", re.I)).click()

    # Confirm deletion in the alert dialog.
    expect(page.get_by_role("heading", name="Are you sure?")).to_be_visible()
    page.get_by_role("button", name="Delete").click()

    # Verify the kit is gone.
    expect(new_kit_card).not_to_be_visible()

    # Take a screenshot for final verification.
    page.screenshot(path="jules-scratch/verification/kit_crud_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)