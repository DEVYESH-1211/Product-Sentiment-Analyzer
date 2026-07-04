import time
import undetected_chromedriver as uc

# Suppress the harmless WinError 6 cleanup exception
try:
    original_del = uc.Chrome.__del__
    def custom_del(self):
        try:
            original_del(self)
        except Exception:
            pass
    uc.Chrome.__del__ = custom_del
except Exception:
    pass

from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrape_product(product_name: str) -> list:
    """
    Scrapes product reviews from Flipkart using Undetected Chromedriver.
    
    Args:
        product_name (str): The name of the product to search for.
        
    Returns:
        list: A list of dictionaries containing review data matching the JSON schema.
    """
    reviews_data = []
    
    # Configure Undetected Chromedriver options
    chrome_options = uc.ChromeOptions()
    chrome_options.headless = True
    chrome_options.add_argument("--no-sandbox")
    
    try:
        # Use undetected_chromedriver and specify version 149 to match system Chrome
        driver = uc.Chrome(options=chrome_options, version_main=149)
    except Exception as e:
        print(f"Error initializing Chrome driver: {e}")
        return reviews_data
        
    try:
        # 1. Search for the product on Flipkart (sorted by popularity to avoid 0-review sponsored items)
        search_url = f"https://www.flipkart.com/search?q={product_name.replace(' ', '+')}&sort=popularity"
        driver.get(search_url)
        time.sleep(4) # Wait for page load and potential dynamic content
        
        # 2. Find the first product link
        links = driver.find_elements(By.TAG_NAME, "a")
        product_url = None
        for link in links:
            href = link.get_attribute("href")
            # Flipkart product URLs contain '/p/' and 'pid='
            if href and "/p/" in href and "pid=" in href:
                product_url = href
                break
                
        if product_url:
            driver.get(product_url)
            time.sleep(4)
        else:
            print("Could not retrieve product URL.")
            return reviews_data
            
        # 3. Navigate to 'All Reviews' page
        reviews_url_base = product_url.replace('/p/', '/product-reviews/')
        if '?' in reviews_url_base:
            reviews_url_base += '&'
        else:
            reviews_url_base += '?'
            
        page = 1
        while len(reviews_data) < 30 and page <= 5:
            reviews_url = f"{reviews_url_base}page={page}"
            driver.get(reviews_url)
            
            # Wait until reviews load instead of hardcoded sleep
            try:
                wait = WebDriverWait(driver, 10)
                wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(@class, 'EKFha-') or contains(text(), 'Helpful for')]")))
            except:
                pass # Just try our best
                
            # Try Old UI first
            review_blocks = driver.find_elements(By.XPATH, "//div[contains(@class, 'EKFha-')]")
            
            # If Old UI fails, try New UI (React Native Web)
            if not review_blocks:
                # Find all "Verified Purchase" text nodes and traverse up to the review container
                vp_elements = driver.find_elements(By.XPATH, "//*[text()='Verified Purchase']")
                for vp in vp_elements:
                    try:
                        block = vp.find_element(By.XPATH, "./ancestor::div[5]")
                        if block not in review_blocks:
                            review_blocks.append(block)
                    except:
                        continue

            if not review_blocks:
                break # No more reviews found on this page
                
            for block in review_blocks:
                if len(reviews_data) >= 30:
                    break
                try:
                    # Get raw lines and filter out empty strings and floating bullet points
                    raw_lines = [l.strip() for l in block.text.split('\n') if l.strip()]
                    lines = [l for l in raw_lines if l not in ['', '·', '•', '*', '.']]
                    
                    if not lines:
                        continue
                        
                    # 1. Rating
                    rating = "0"
                    first_word = lines[0].split()[0]
                    if first_word.replace('.', '', 1).isdigit():
                        rating = first_word

                    # 3. Extract Reviewer Name FIRST
                    reviewer_name = "Anonymous"
                    name_found_idx = len(lines)
                    for k in range(len(lines)-1, 0, -1):
                        l = lines[k]
                        l_lower = l.lower()
                        if l == "Verified Purchase" or l.startswith("Helpful"):
                            continue
                        if " ago" in l_lower or "202" in l_lower or "201" in l_lower or "200" in l_lower:
                            continue
                        if l.startswith(", "):
                            continue
                        if l.strip().isdigit(): # Skip up/down votes
                            continue
                        if l == "READ MORE":
                            continue
                        if len(l) > 30: 
                            continue
                        
                        reviewer_name = l.split(",")[0].strip()
                        name_found_idx = k
                        break

                    # 2. Extract Text
                    # Text usually starts after the title or "Review for:"
                    start_idx = 1
                    if len(lines) > 1:
                        if lines[1].startswith("Review for:"):
                            start_idx = 2
                        elif len(lines) > 2 and lines[2].startswith("Review for:"):
                            start_idx = 3
                        elif len(lines) > 1 and len(lines[0].split()) == 1:
                            start_idx = 2

                    end_idx = name_found_idx
                    for j, l in enumerate(lines):
                        if l.startswith("Helpful") or l == "Verified Purchase":
                            end_idx = min(end_idx, j)
                    
                    if start_idx < end_idx:
                        text = " ".join(lines[start_idx:end_idx])
                    else:
                        text = ""

                    # Cleanup review text
                    clean_review_text = text.replace("READ MORE", "").strip()
                    # Remove leading bullet points or strange chars if they snuck in
                    while clean_review_text and clean_review_text[0] in ['', '·', '•', '-', '*']:
                        clean_review_text = clean_review_text[1:].strip()
                    
                    date_str = datetime.now().strftime("%Y-%m-%d")
                    
                    if clean_review_text:
                        try:
                            int_rating = int(float(rating))
                        except ValueError:
                            int_rating = 0

                        reviews_data.append({
                            "product": product_name,
                            "review": clean_review_text,
                            "rating": int_rating,
                            "reviewer": reviewer_name,
                            "date": date_str,
                            "source": "Flipkart"
                        })
                        
                except Exception as e:
                    print(f"Parsing error: {e}")
                    continue
            
            page += 1 # Load next page of reviews
            time.sleep(2)
                
    except Exception as e:
        print(f"An error occurred while scraping: {e}")
        
    finally:
        driver.quit()
    return reviews_data
