import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import joblib
import os
import random

print("Loading enterprise-grade simulated dataset...")

# Realistic ham (legitimate emails)
ham_emails = [
    "Hi team, just a reminder that the Q3 planning meeting is scheduled for 2 PM tomorrow. Please review the attached memo.",
    "Can you please send me the latest version of the slides for the client presentation? Thanks.",
    "Hey John, are we still on for lunch today at the usual place? Let me know if you need to reschedule.",
    "Please find attached the invoice for my consulting services rendered in August. Net 30 terms apply.",
    "It was great speaking with you yesterday. As discussed, I will forward the contract drafts by EOD Friday.",
    "Your Amazon.com order of 'Wireless Noise Cancelling Headphones' has shipped. Track your package here.",
    "Hi Sarah, just wanted to follow up on the software architecture document. Let me know when you have time for a review.",
    "The server deployment finished successfully. All systems are operational and health checks passed.",
    "Happy Birthday! Hope you have a fantastic day and celebrate well. See you at the party this weekend.",
    "I'll be out of office starting next week from Monday to Wednesday. Please contact Dave for urgent matters.",
    "Weekly project sync: Attached are the meeting minutes. Key action item is for marketing to finalize the ad copy.",
    "Thanks for reaching out. At the moment our engineering bandwith is at capacity, let's reconnect next quarter.",
    "Your GitHub account password was successfully reset. If this wasn't you, please contact support immediately.",
    "Looking forward to the conference in Berlin! Have you booked your flights yet?",
    "Could someone from the backend team approve my pull request? It addresses the database timeout issue.",
    "Agenda for tomorrow's standup: 1. Blockers, 2. Sprint progress, 3. Upcoming holidays.",
    "Just read that article you forwarded me. Highly insightful! Let's discuss these strategies on our next call.",
    "Mom, can you call me back when you get this? It's about the holiday plans.",
    "To all employees: Please ensure you complete the mandatory compliance training by November 30th.",
    "Here is the code snippet for the authentication flow we discussed. Let me know if it solves the bug."
]

# Realistic spam and phishing emails
spam_emails = [
    "URGENT: Your PayPal account has been permanently restricted. Please verify your identity immediately by clicking here.",
    "Congratulations! You are the lucky winner of a $10,000 Walmart Gift Card! Click this link to claim your prize before it expires.",
    "Earn $500 to $1000 daily working from home. No experience required. Start now! Text us at 555-0192 for the application form.",
    "Your Netflix subscription has expired. Please update your payment details within 24 hours to avoid service interruption.",
    "Invest in the next Bitcoin! Our new crypto token guarantees 500% returns in just one month. Don't miss out on this life-changing opportunity.",
    "FINAL NOTICE: You owe taxes to the IRS. If you do not pay the fine immediately using Apple Gift Cards, local law enforcement will be dispatched.",
    "Hey dear, I saw your profile and really liked your pictures. Click my private link to see more of me and chat live.",
    "Your bank account has detected suspicious login attempts. For security reasons, your account is temporarily locked. Validate your KYC via this link.",
    "Meet single Russian women looking for romance. 100% free registration. Find your true love today!",
    "Lose 20 pounds in one week with our miracle weight loss pills! Doctors hate this simple trick. Order yours today at 50% discount.",
    "We have recorded you through your webcam. If you don't send 0.5 BTC to this wallet address, we will send an embarrassing video to all your contacts.",
    "Greetings from the desk of Barrister John. I represent a deceased client who left behind $15 million. Please reply for 50% share of this fortune.",
    "You have a pending package delivery from FedEx. Tracking number #4982390. Please pay the $2.00 customs fee to release your package.",
    "Approve this transaction: $950 was charged to your Apple account. If you did not authorize this, call our customer care hotline immediately.",
    "We are seeking data entry personnel. Salary is $200 per hour. Just provide your bank details to get started with direct deposit.",
    "Boost your website ranking overnight! We offer cheap SEO services guaranteed to get you on Google Page 1. Reply to this email for a quote.",
    "Claim your exclusive government grant check of $5,000. It is completely free money you don't have to pay back! Apply here.",
    "Hello user, your email mailbox is almost full (99%). You will not receive any new messages until you upgrade your quota.",
    "Your MetaMask wallet has failed verification. Please connect your wallet and input your 12-word seed phrase to secure your funds.",
    "Do you need a loan? We offer personal loans up to $100,000 with incredibly low interest rates and no credit check. Click to apply."
]

# Create dataset
texts = ham_emails + spam_emails
labels = ['Ham'] * len(ham_emails) + ['Spam'] * len(spam_emails)

# Shuffle dataset
combined = list(zip(texts, labels))
random.shuffle(combined)
texts, labels = zip(*combined)

df = pd.DataFrame({'text': texts, 'label': labels})

print(f"Dataset compiled. Training on {len(df)} realistic emails...")

# Build a robust Scikit-Learn Pipeline
# TfidfVectorizer ignores common words but extracts 1-grams and 2-grams
model = make_pipeline(
    TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_df=0.9, min_df=2),
    MultinomialNB(alpha=0.5)
)

model.fit(df['text'], df['label'])

# Save model
model_path = os.path.join(os.path.dirname(__file__), 'spam_model.pkl')
print(f"Saving robust model to {model_path}...")
joblib.dump(model, model_path)
print("Model trained and saved successfully! Restart your app.py to apply the changes.")
