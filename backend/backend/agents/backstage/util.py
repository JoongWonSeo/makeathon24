def extract_values(obj, key):
    """Recursively fetch values from nested JSON."""
    arr = []

    def extract(obj, arr, key):
        """Recursively search for values of key in JSON tree."""
        if isinstance(obj, dict):
            for k, v in obj.items():
                if k == key:
                    arr.append(v)
                elif isinstance(v, (dict, list)):
                    extract(v, arr, key)
        elif isinstance(obj, list):
            for item in obj:
                extract(item, arr, key)
        return arr

    results = extract(obj, arr, key)
    return results


def remove_objects_by_key(obj, keys, searched_value):
    """Recursively remove objects from lists if object[key] == searched_value."""

    if isinstance(obj, dict):
        # Check if this dictionary itself should be deleted
        for key in keys:
            if key in obj and obj[key] == searched_value:
                return None
        # Otherwise, iterate over keys and modify in place if needed
        for k, v in list(obj.items()):
            new_val = remove_objects_by_key(v, keys, searched_value)
            if new_val is None:
                del obj[k]
            else:
                obj[k] = new_val

    elif isinstance(obj, list):
        # Process each item in the list, removing those that need to be deleted
        new_list = []
        for item in obj:
            result = remove_objects_by_key(item, keys, searched_value)
            if result is not None:
                new_list.append(result)
        return new_list

    return obj


def remove_title(d) -> dict | list:
    if isinstance(d, dict):
        if "title" in d and type(d["title"]) == str:
            d.pop("title")
        for v in d.values():
            remove_title(v)
    elif isinstance(d, list):
        for v in d:
            remove_title(v)
    return d


def prettier_filter(filter_json):
    def parse_condition(condition):
        """Parses individual conditions into a human-readable format."""
        key = condition.get("key")
        if "match" in condition:
            match = condition["match"]
            if "value" in match:
                return f"{key} == {repr(match['value'])}"
            elif "text" in match:
                return f"{key} MATCHES {repr(match['text'])}"
            elif "any" in match:
                return f"{key} IN {match['any']}"
            elif "except" in match:
                return f"{key} NOT IN {match['except']}"
        elif "range" in condition:
            range_parts = []
            range = condition["range"]
            if "gte" in range:
                range_parts.append(f"{key} >= {range['gte']}")
            if "gt" in range:
                range_parts.append(f"{key} > {range['gt']}")
            if "lte" in range:
                range_parts.append(f"{key} <= {range['lte']}")
            if "lt" in range:
                range_parts.append(f"{key} < {range['lt']}")
            return " AND ".join(range_parts)
        return ""

    def parse_filter(filt):
        """Recursively parses filter conditions."""
        parts = []
        if "must" in filt and filt["must"] is not None:
            must_conditions = " AND ".join(
                parse_filter(cond) if "key" not in cond else parse_condition(cond)
                for cond in filt["must"]
            )
            parts.append(f"({must_conditions})")
        if "should" in filt and filt["should"] is not None:
            should_conditions = " OR ".join(
                parse_filter(cond) if "key" not in cond else parse_condition(cond)
                for cond in filt["should"]
            )
            parts.append(f"({should_conditions})")
        if "must_not" in filt and filt["must_not"] is not None:
            must_not_conditions = " AND NOT ".join(
                parse_filter(cond) if "key" not in cond else parse_condition(cond)
                for cond in filt["must_not"]
            )
            parts.append(f"NOT ({must_not_conditions})")
        return " AND ".join(parts)

    return parse_filter(filter_json)
