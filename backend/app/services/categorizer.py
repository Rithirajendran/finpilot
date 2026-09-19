def categorize_transaction(description: str) -> str:
    """
    Categorize a transaction based on its description.
    """

    if not description:
        return "Other"

    text = description.lower().strip()

    # Food
    food_keywords = [
        "swiggy",
        "zomato",
        "restaurant",
        "food",
        "cafe",
        "coffee",
        "dominos",
        "pizza",
        "mcdonald",
        "kfc",
        "eat"
    ]

    # Entertainment
    entertainment_keywords = [
        "netflix",
        "spotify",
        "prime video",
        "amazon prime",
        "hotstar",
        "disney",
        "youtube premium",
        "movie",
        "cinema",
        "pvr",
        "bookmyshow"
    ]

    # Transport
    transport_keywords = [
        "uber",
        "ola",
        "rapido",
        "metro",
        "bus",
        "train",
        "railway",
        "transport",
        "petrol",
        "fuel",
        "parking"
    ]

    # Shopping
    shopping_keywords = [
        "amazon",
        "myntra",
        "flipkart",
        "meesho",
        "ajio",
        "shopping",
        "mall",
        "clothing",
        "fashion"
    ]

    # Bills / Utilities
    bills_keywords = [
        "airtel",
        "jio",
        "vi ",
        "vodafone",
        "electricity",
        "water bill",
        "gas bill",
        "internet",
        "broadband",
        "mobile bill",
        "recharge",
        "bill",
        "utility"
    ]

    # Health
    health_keywords = [
        "hospital",
        "clinic",
        "pharmacy",
        "medical",
        "medicine",
        "doctor",
        "apollo",
        "health"
    ]

    # Education
    education_keywords = [
        "college",
        "university",
        "school",
        "course",
        "udemy",
        "coursera",
        "education",
        "books",
        "exam",
        "tuition"
    ]

    # Check categories
    if any(keyword in text for keyword in food_keywords):
        return "Food"

    if any(keyword in text for keyword in entertainment_keywords):
        return "Entertainment"

    if any(keyword in text for keyword in transport_keywords):
        return "Transport"

    if any(keyword in text for keyword in shopping_keywords):
        return "Shopping"

    if any(keyword in text for keyword in bills_keywords):
        return "Bills"

    if any(keyword in text for keyword in health_keywords):
        return "Health"

    if any(keyword in text for keyword in education_keywords):
        return "Education"

    return "Other"