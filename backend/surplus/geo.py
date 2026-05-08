REGION_COORDS = {
    "nakuru":        [-0.3031, 36.0800],
    "eldoret":       [0.5143, 35.2698],
    "nairobi":       [-1.2921, 36.8219],
    "kisumu":        [-0.1022, 34.7617],
    "kitale":        [1.0162, 35.0062],
    "muranga":       [-0.7266, 37.1528],
    "meru":          [0.0500, 37.6500],
    "nyeri":         [-0.4215, 36.9475],
    "trans_nzoia":   [1.0500, 34.9500],
    "uasin_gishu":   [0.5200, 35.2800],
    "kakamega":      [0.2827, 34.7519],
    "bungoma":       [0.5695, 34.5604],
    "busia":         [0.4600, 34.1100],
    "vihiga":        [0.0383, 34.7247],
    "siaya":         [0.0600, 34.2800],
    "kisii":         [-0.6800, 34.7700],
    "migori":        [-1.0700, 34.4700],
    "machakos":      [-1.5177, 37.2634],
    "makueni":       [-2.0000, 37.6600],
    "kitui":         [-1.3700, 38.0100],
    "kirinyaga":     [-0.5000, 37.2800],
    "laikipia":      [0.0500, 36.8700],
    "nandi":         [0.1700, 35.1400],
    "west_pokot":    [1.2400, 35.1700],
    "elgeyo_marakwet": [0.8000, 35.5000],
}

def region_to_coords(region: str) -> tuple[float, float]:
    key = region.lower().replace(" ", "_").replace("-", "_")
    coords = REGION_COORDS.get(key)
    if coords:
        return tuple(coords)
    return [-0.3031, 36.0800]  # default Nakuru

def coords_to_region(lat: float, lon: float) -> str:
    closest = "nakuru"
    min_dist = float("inf")
    for name, (rlat, rlon) in REGION_COORDS.items():
        dist = ((lat - rlat) ** 2 + (lon - rlon) ** 2) ** 0.5
        if dist < min_dist:
            min_dist = dist
            closest = name
    return closest
