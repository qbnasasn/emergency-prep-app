import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go directly to the kit builder page.
    # This bypasses the need for a full login flow in this verification script.
    page.goto("http://localhost:3000/dashboard/kits/builder")
    expect(page).to_have_url("http://localhost:3000/dashboard/kits/builder")

    # Fill out the kit details.
    page.get_by_label("Kit Name").fill("My Test Go-Bag")
    page.get_by_label("Description").fill("A test kit created by a script.")
    page.get_by_label("GPS Coordinates").fill("34.0522, -118.2437")

    # Select a category and wait for suggested items to appear.
    page.get_by_label("Category").click()
    page.get_by_text("Go-Bag (Bug-Out Bag) 72-hours").click()

    # Verify that the suggested items section is now visible.
    suggested_items_header = page.get_by_role("heading", name="Suggested Items for Go-Bag (Bug-Out Bag) 72-hours")
    expect(suggested_items_header).to_be_visible()

    # Take a screenshot for verification.
    page.screenshot(path="jules-scratch/verification/kit_builder_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)