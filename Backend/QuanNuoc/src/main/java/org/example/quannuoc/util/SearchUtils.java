package org.example.quannuoc.util;

public class SearchUtils {
    public static String getNormalizedKeyword(String keyword) {
        return (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
    }
}
