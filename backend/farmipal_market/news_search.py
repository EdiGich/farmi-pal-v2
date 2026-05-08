import logging
from dataclasses import dataclass

from googlesearch import search

logger = logging.getLogger(__name__)


@dataclass
class NewsResult:
    title: str
    summary: str
    source: str
    published_at: str
    relevance_tags: list[str]


class MarketNewsSearcher:
    def search_news(self, crop: str, region: str, price_change_pct: float) -> list[NewsResult]:
        query = self._build_query(crop, region, price_change_pct)

        try:
            raw_results = list(search(query, num_results=8, advanced=True))
        except Exception as e:
            logger.warning("Google search failed: %s", e)
            return []

        results = []
        for r in raw_results:
            tags = self._classify(r.title + " " + (r.description or ""))
            results.append(NewsResult(
                title=r.title,
                summary=r.description or "",
                source=r.url,
                published_at="",
                relevance_tags=tags,
            ))

        return results

    def _build_query(self, crop: str, region: str, price_change_pct: float) -> str:
        direction = "surplus oversupply" if price_change_pct < -3 else "shortage disruption"
        return (
            f"{crop} price {region} Kenya {direction} 2025 "
            f"site:nation.africa OR site:businessdailyafrica.com OR site:theeastafrican.co.ke"
        )

    def _classify(self, text: str) -> list[str]:
        text_lower = text.lower()
        tags = []
        if any(w in text_lower for w in ["ban", "export", "import", "restriction"]):
            tags.append("trade_policy")
        if any(w in text_lower for w in ["road", "transport", "logistics", "flood"]):
            tags.append("logistics")
        if any(w in text_lower for w in ["rain", "drought", "weather", "harvest"]):
            tags.append("weather_crop")
        if any(w in text_lower for w in ["surplus", "glut", "oversupply"]):
            tags.append("oversupply")
        if any(w in text_lower for w in ["shortage", "scarcity", "demand"]):
            tags.append("shortage")
        return tags or ["general"]
