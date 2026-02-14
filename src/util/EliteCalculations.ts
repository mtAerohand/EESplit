/**
 * Elite enemy counting utilities for EESplit
 *
 * Provides functions for managing elite counts per segment,
 * calculating performance metrics, and determining highlight targets.
 */

import * as LiveSplit from "../livesplit-core";

// Naming convention for elite count custom variables
const ELITE_COUNT_PREFIX = "__elite_count_seg_";

export interface EliteSegmentData {
    segmentIndex: number;
    eliteCount: number;
    segmentTime?: number;  // in seconds
    avgSecondsPerElite?: number;
}

export interface HighlightSettings {
    mode: 'percentage' | 'rank' | 'absolute' | 'none';
    percentage?: number;
    rank?: number;
    threshold?: number;
}

/**
 * Get custom variable key for segment elite count
 */
export function getEliteCountKey(segmentIndex: number): string {
    return `${ELITE_COUNT_PREFIX}${segmentIndex}`;
}

/**
 * Parse elite count from custom variable value
 * Returns 0 for invalid or missing values
 */
export function parseEliteCount(value: string | undefined): number {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

/**
 * Get elite count for a specific segment from editor state
 */
export function getSegmentEliteCount(
    editorState: LiveSplit.RunEditorStateJson,
    segmentIndex: number,
): number {
    const key = getEliteCountKey(segmentIndex);
    const customVar = editorState.metadata.custom_variables[key];
    return customVar ? parseEliteCount(customVar.value) : 0;
}

/**
 * Set elite count for a segment via custom variables
 */
export function setSegmentEliteCount(
    editor: LiveSplit.RunEditorRefMut,
    segmentIndex: number,
    eliteCount: number,
): void {
    const key = getEliteCountKey(segmentIndex);
    const value = Math.max(0, Math.floor(eliteCount)).toString();

    // Set as permanent custom variable (saved with run)
    editor.setCustomVariable(key, value);

    // Note: setCustomVariableIsPermanent may not exist in all versions
    // The variable should be permanent by default in metadata
    if (typeof (editor as any).setCustomVariableIsPermanent === 'function') {
        (editor as any).setCustomVariableIsPermanent(key, true);
    }
}

/**
 * Calculate total elite count across all segments
 */
export function getTotalEliteCount(editorState: LiveSplit.RunEditorStateJson): number {
    let total = 0;
    for (let i = 0; i < editorState.segments.length; i++) {
        total += getSegmentEliteCount(editorState, i);
    }
    return total;
}

/**
 * Calculate average seconds per elite for a segment
 * Returns undefined if calculation not possible (no elites or no time)
 */
export function calculateAvgSecondsPerElite(
    segmentTimeSeconds: number | undefined,
    eliteCount: number,
): number | undefined {
    if (segmentTimeSeconds === undefined || segmentTimeSeconds <= 0) {
        return undefined;
    }
    if (eliteCount <= 0) {
        return undefined;
    }
    return segmentTimeSeconds / eliteCount;
}

/**
 * Format average seconds per elite for display
 */
export function formatAvgSecondsPerElite(
    avgSeconds: number | undefined,
): string {
    if (avgSeconds === undefined) {
        return "—";
    }
    return `${avgSeconds.toFixed(1)}秒/体`;
}

/**
 * Parse time string to seconds
 * Handles formats: "1:23.45", "23.45", "1:23:45.67"
 * Returns undefined for invalid or empty strings
 */
export function parseTimeString(timeStr: string | undefined): number | undefined {
    if (!timeStr || timeStr === "—" || timeStr.trim() === "") {
        return undefined;
    }

    const parts = timeStr.split(':');
    let seconds = 0;

    try {
        if (parts.length === 1) {
            // "23.45"
            seconds = parseFloat(parts[0]);
        } else if (parts.length === 2) {
            // "1:23.45"
            seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 3) {
            // "1:23:45.67"
            seconds = parseInt(parts[0], 10) * 3600 +
                      parseInt(parts[1], 10) * 60 +
                      parseFloat(parts[2]);
        } else {
            return undefined;
        }

        return isNaN(seconds) ? undefined : seconds;
    } catch {
        return undefined;
    }
}

/**
 * Get all segment data with elite calculations
 */
export function getAllSegmentEliteData(
    editorState: LiveSplit.RunEditorStateJson,
): EliteSegmentData[] {
    return editorState.segments.map((segment, index) => {
        const eliteCount = getSegmentEliteCount(editorState, index);

        // Parse segment time from string
        const segmentTime = parseTimeString(segment.segment_time);

        const avgSecondsPerElite = calculateAvgSecondsPerElite(
            segmentTime,
            eliteCount,
        );

        return {
            segmentIndex: index,
            eliteCount,
            segmentTime,
            avgSecondsPerElite,
        };
    });
}

/**
 * Determine which segments should be highlighted based on settings
 * Returns a Set of segment indices that should be highlighted
 */
export function getHighlightedSegments(
    segmentData: EliteSegmentData[],
    settings: HighlightSettings,
): Set<number> {
    const highlighted = new Set<number>();

    if (settings.mode === 'none') {
        return highlighted;
    }

    // Filter segments with valid average (must have elite count and time)
    const validSegments = segmentData.filter(
        s => s.avgSecondsPerElite !== undefined,
    );

    if (validSegments.length === 0) {
        return highlighted;
    }

    switch (settings.mode) {
        case 'percentage': {
            if (settings.percentage === undefined || settings.percentage <= 0) {
                break;
            }

            // Sort by avg (descending - worst first)
            const sorted = [...validSegments].sort(
                (a, b) => (b.avgSecondsPerElite! - a.avgSecondsPerElite!),
            );

            // Calculate how many to highlight
            const count = Math.ceil(sorted.length * (settings.percentage / 100));

            for (let i = 0; i < count && i < sorted.length; i++) {
                highlighted.add(sorted[i].segmentIndex);
            }
            break;
        }

        case 'rank': {
            if (settings.rank === undefined || settings.rank <= 0) {
                break;
            }

            // Sort by avg (descending - worst first)
            const sorted = [...validSegments].sort(
                (a, b) => (b.avgSecondsPerElite! - a.avgSecondsPerElite!),
            );

            // Highlight bottom N
            for (let i = 0; i < settings.rank && i < sorted.length; i++) {
                highlighted.add(sorted[i].segmentIndex);
            }
            break;
        }

        case 'absolute': {
            if (settings.threshold === undefined || settings.threshold <= 0) {
                break;
            }

            // Highlight segments exceeding threshold
            for (const segment of validSegments) {
                if (segment.avgSecondsPerElite! >= settings.threshold) {
                    highlighted.add(segment.segmentIndex);
                }
            }
            break;
        }
    }

    return highlighted;
}

/**
 * Calculate the number of completed elites based on current split index
 * @param editorState Run editor state containing segment data
 * @param currentSplitIndex Current split index (from timer state)
 * @returns Number of elites in completed segments
 */
export function getCompletedEliteCount(
    editorState: LiveSplit.RunEditorStateJson,
    currentSplitIndex: number | undefined,
): number {
    if (currentSplitIndex === undefined || currentSplitIndex <= 0) {
        return 0;
    }

    let completed = 0;
    for (let i = 0; i < currentSplitIndex && i < editorState.segments.length; i++) {
        completed += getSegmentEliteCount(editorState, i);
    }
    return completed;
}
