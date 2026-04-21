from __future__ import annotations

from copy import deepcopy


DEFAULT_ARCHIVE_IMAGE = (
    "https://images.unsplash.com/photo-1495020689067-958852a7765e"
    "?auto=format&fit=crop&w=1200&q=80"
)


ARCHIVE_NEWS = {
    2020: [
        {
            "title": "WHO declares COVID-19 a global pandemic",
            "category": "Health",
            "date": "2020-03-11",
            "description": (
                "The World Health Organization formally declared COVID-19 a "
                "pandemic as outbreaks spread rapidly across continents."
            ),
            "image": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.who.int/europe/emergencies/situations/covid-19",
        },
        {
            "title": "Global lockdowns reshape work, travel, and education",
            "category": "World",
            "date": "2020-04-15",
            "description": (
                "Governments worldwide introduced sweeping restrictions, "
                "pushing schools and offices into remote-first routines."
            ),
            "image": "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/coronavirus",
        },
        {
            "title": "Pfizer and BioNTech report strong vaccine trial results",
            "category": "Science",
            "date": "2020-11-09",
            "description": (
                "Early trial data signaled that mRNA vaccines could become a "
                "turning point in the pandemic response."
            ),
            "image": "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/us/pfizer-biontech-say-covid-19-vaccine-95-effective-final-data-2020-11-18/",
        },
        {
            "title": "Black Lives Matter protests spark global conversations on policing",
            "category": "World",
            "date": "2020-06-06",
            "description": (
                "Large demonstrations across the United States and beyond "
                "renewed scrutiny on racial justice and police reform."
            ),
            "image": "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/us/",
        },
        {
            "title": "Beirut explosion shocks Lebanon and the wider region",
            "category": "World",
            "date": "2020-08-04",
            "description": (
                "A massive port explosion devastated Beirut, deepening "
                "Lebanon's political and economic crisis."
            ),
            "image": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/middle-east/",
        },
        {
            "title": "US presidential election delivers a high-stakes transfer of power",
            "category": "Politics",
            "date": "2020-11-07",
            "description": (
                "The election dominated global attention as voters turned out "
                "in record numbers amid the pandemic."
            ),
            "image": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/us/us-elections/",
        },
    ],
    2021: [
        {
            "title": "Mass vaccination campaigns accelerate across the world",
            "category": "Health",
            "date": "2021-02-01",
            "description": (
                "Countries ramped up vaccination drives while balancing supply "
                "constraints and public health measures."
            ),
            "image": "https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=1200&q=80",
            "url": "https://ourworldindata.org/covid-vaccinations",
        },
        {
            "title": "COP26 puts climate commitments under global scrutiny",
            "category": "Climate",
            "date": "2021-11-13",
            "description": (
                "World leaders concluded COP26 with renewed pledges on "
                "emissions, coal, and climate finance."
            ),
            "image": "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange/cop26",
        },
        {
            "title": "Mars exploration gains momentum with Perseverance rover",
            "category": "Science",
            "date": "2021-02-18",
            "description": (
                "NASA's Perseverance rover landed on Mars, opening a new phase "
                "of robotic exploration and sample collection."
            ),
            "image": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
            "url": "https://mars.nasa.gov/mars2020/",
        },
        {
            "title": "Suez Canal blockage disrupts global shipping routes",
            "category": "Business",
            "date": "2021-03-29",
            "description": (
                "The Ever Given grounding highlighted how quickly a single "
                "supply chain bottleneck could ripple through world trade."
            ),
            "image": "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/middle-east/",
        },
        {
            "title": "Taliban takeover of Kabul redraws the geopolitical map",
            "category": "World",
            "date": "2021-08-15",
            "description": (
                "Afghanistan's government collapsed rapidly as the Taliban "
                "entered Kabul and international evacuations intensified."
            ),
            "image": "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/asia-pacific/",
        },
        {
            "title": "Bitcoin and crypto markets swing wildly after record highs",
            "category": "Economy",
            "date": "2021-05-19",
            "description": (
                "Sharp volatility in crypto assets brought renewed focus to "
                "regulation, risk, and retail investor exposure."
            ),
            "image": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/markets/currencies/",
        },
    ],
    2022: [
        {
            "title": "Russia invades Ukraine, triggering a global crisis",
            "category": "World",
            "date": "2022-02-24",
            "description": (
                "The invasion sparked major geopolitical, humanitarian, and "
                "energy market consequences around the world."
            ),
            "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/europe/what-happened-when-russia-invaded-ukraine-2022-02-24/",
        },
        {
            "title": "Inflation and rate hikes dominate the economic outlook",
            "category": "Economy",
            "date": "2022-09-21",
            "description": (
                "Central banks raised interest rates aggressively as inflation "
                "surged across major economies."
            ),
            "image": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.imf.org/en/Topics/inflation",
        },
        {
            "title": "James Webb telescope releases landmark deep-space images",
            "category": "Science",
            "date": "2022-07-12",
            "description": (
                "NASA unveiled the first full-color images from the James Webb "
                "Space Telescope, marking a major astronomy milestone."
            ),
            "image": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.nasa.gov/webbfirstimages/",
        },
        {
            "title": "Queen Elizabeth II dies after a record-breaking reign",
            "category": "World",
            "date": "2022-09-08",
            "description": (
                "The death of Britain's longest-reigning monarch marked a "
                "historic transition for the United Kingdom."
            ),
            "image": "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/uk/",
        },
        {
            "title": "ChatGPT's public debut accelerates the AI race",
            "category": "Technology",
            "date": "2022-11-30",
            "description": (
                "The release of a mainstream conversational AI product pushed "
                "generative AI into everyday public discussion."
            ),
            "image": "https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "FIFA World Cup in Qatar becomes a defining global media event",
            "category": "Sport",
            "date": "2022-12-18",
            "description": (
                "The tournament drew worldwide attention to football, hosting "
                "infrastructure, and human rights debates."
            ),
            "image": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/lifestyle/sports/",
        },
    ],
    2023: [
        {
            "title": "Generative AI moves into the mainstream",
            "category": "Technology",
            "date": "2023-03-15",
            "description": (
                "AI tools expanded quickly across search, productivity, and "
                "creative work, prompting debate over regulation and jobs."
            ),
            "image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "India lands Chandrayaan-3 near the Moon's south pole",
            "category": "Science",
            "date": "2023-08-23",
            "description": (
                "India became the first country to land near the lunar south "
                "pole, strengthening its position in space exploration."
            ),
            "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.isro.gov.in/Chandrayaan3.html",
        },
        {
            "title": "COP28 ends with a call to transition away from fossil fuels",
            "category": "Climate",
            "date": "2023-12-13",
            "description": (
                "The summit concluded with language that signaled a stronger "
                "global push away from fossil fuel dependence."
            ),
            "image": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange/cop28",
        },
        {
            "title": "Silicon Valley Bank collapse rattles global financial markets",
            "category": "Economy",
            "date": "2023-03-10",
            "description": (
                "The bank's sudden failure reignited concerns over liquidity, "
                "interest rates, and confidence in the financial system."
            ),
            "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/markets/",
        },
        {
            "title": "Wildfires and heatwaves intensify the climate emergency narrative",
            "category": "Climate",
            "date": "2023-07-25",
            "description": (
                "Extreme weather events across several continents underscored "
                "the urgency of adaptation and mitigation policies."
            ),
            "image": "https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange",
        },
        {
            "title": "Israel-Gaza war dominates global diplomacy and humanitarian coverage",
            "category": "World",
            "date": "2023-10-07",
            "description": (
                "The conflict drove urgent diplomatic efforts and heightened "
                "international concern over civilian safety."
            ),
            "image": "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/middle-east/",
        },
    ],
    2024: [
        {
            "title": "Global elections reshape political narratives",
            "category": "Politics",
            "date": "2024-06-15",
            "description": (
                "Major elections in multiple countries kept governance, "
                "economic policy, and misinformation at the center of debate."
            ),
            "image": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/",
        },
        {
            "title": "Chip demand and AI infrastructure fuel tech investment",
            "category": "Business",
            "date": "2024-09-10",
            "description": (
                "Semiconductor and cloud companies benefited from rising "
                "spending on data centers and AI systems."
            ),
            "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "Extreme weather keeps climate adaptation in focus",
            "category": "Climate",
            "date": "2024-08-05",
            "description": (
                "Floods, heatwaves, and storms intensified calls for resilient "
                "infrastructure and faster emissions cuts."
            ),
            "image": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange",
        },
        {
            "title": "Olympics and major sporting events return as global attention magnets",
            "category": "Sport",
            "date": "2024-07-26",
            "description": (
                "International sporting competitions again became focal points "
                "for national branding, tourism, and broadcast audiences."
            ),
            "image": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/lifestyle/sports/",
        },
        {
            "title": "AI assistants become more embedded in workplace software",
            "category": "Technology",
            "date": "2024-05-22",
            "description": (
                "Productivity platforms expanded AI features, reshaping how "
                "teams search, write, summarize, and automate tasks."
            ),
            "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "Central banks weigh the timing of long-awaited rate cuts",
            "category": "Economy",
            "date": "2024-11-07",
            "description": (
                "Investors tracked inflation progress closely as policymakers "
                "balanced growth concerns against price stability."
            ),
            "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/markets/",
        },
    ],
    2025: [
        {
            "title": "AI regulation and competition become central policy themes",
            "category": "Technology",
            "date": "2025-03-18",
            "description": (
                "Governments and companies navigated the balance between rapid "
                "AI deployment, safety, and market competition."
            ),
            "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "Clean energy investment continues to expand globally",
            "category": "Economy",
            "date": "2025-05-09",
            "description": (
                "Solar, battery, and grid projects attracted new capital as "
                "countries pushed energy transition programs."
            ),
            "image": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.iea.org/topics/renewables",
        },
        {
            "title": "Space and satellite missions drive a new commercial race",
            "category": "Science",
            "date": "2025-10-02",
            "description": (
                "Public and private missions expanded ambitions in launch, "
                "communications, Earth observation, and lunar programs."
            ),
            "image": "https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.nasa.gov/news/",
        },
        {
            "title": "Global supply chains pivot toward resilience over pure efficiency",
            "category": "Business",
            "date": "2025-02-11",
            "description": (
                "Manufacturers and retailers continued diversifying suppliers "
                "and logistics routes to reduce geopolitical risk."
            ),
            "image": "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/",
        },
        {
            "title": "Electric vehicle competition reshapes automaker strategies",
            "category": "Business",
            "date": "2025-06-24",
            "description": (
                "Carmakers adjusted pricing, battery plans, and software "
                "roadmaps as EV markets became more competitive."
            ),
            "image": "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/business/autos-transportation/",
        },
        {
            "title": "Climate adaptation spending rises after repeated weather shocks",
            "category": "Climate",
            "date": "2025-09-16",
            "description": (
                "Governments expanded investment in flood control, grid "
                "hardening, and heat resilience after costly disasters."
            ),
            "image": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange",
        },
    ],
    2026: [
        {
            "title": "Markets track the next wave of AI-led productivity bets",
            "category": "Business",
            "date": "2026-01-21",
            "description": (
                "Investors watched whether AI spending would translate into "
                "measurable gains across software, chips, and enterprise tools."
            ),
            "image": "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/markets/",
        },
        {
            "title": "Public debate grows around platform trust and verification",
            "category": "Technology",
            "date": "2026-02-14",
            "description": (
                "News literacy, source transparency, and verification tooling "
                "remained important as digital platforms evolved."
            ),
            "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "Climate resilience stays high on city planning agendas",
            "category": "Climate",
            "date": "2026-04-01",
            "description": (
                "Urban planners continued prioritizing water, heat, and transit "
                "resilience as weather volatility persisted."
            ),
            "image": "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange",
        },
        {
            "title": "Enterprises push for measurable returns from generative AI rollouts",
            "category": "Technology",
            "date": "2026-03-12",
            "description": (
                "Leadership teams increasingly focused on cost control, trust, "
                "and productivity metrics for deployed AI systems."
            ),
            "image": "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/technology/",
        },
        {
            "title": "Cities expand resilience projects after recurring heat and flood alerts",
            "category": "Climate",
            "date": "2026-05-20",
            "description": (
                "Urban infrastructure planning continued shifting toward "
                "cooling, drainage, and emergency readiness investments."
            ),
            "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.un.org/en/climatechange",
        },
        {
            "title": "Cross-border regulation keeps digital trust and verification in focus",
            "category": "Politics",
            "date": "2026-06-30",
            "description": (
                "Policymakers debated platform responsibility, identity, and "
                "content authenticity standards across major markets."
            ),
            "image": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
            "url": "https://www.reuters.com/world/",
        },
    ],
}


def get_explore_news(year: int, limit: int = 18) -> tuple[list[dict], str]:
    articles = deepcopy(ARCHIVE_NEWS.get(year, []))[: max(limit, 0)]

    for index, article in enumerate(articles):
        article.setdefault("id", f"archive-{year}-{index}")
        article.setdefault("image", DEFAULT_ARCHIVE_IMAGE)
        article.setdefault("content", article.get("description", ""))

    if not articles:
        return [], f"No archived highlights are available for {year} yet."

    return articles, f"Showing curated archive highlights for {year}."
