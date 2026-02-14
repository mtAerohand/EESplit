import * as React from "react";

import * as classes from "../../css/EliteCounter.module.scss";
import { Language, Label, resolve } from "../../localization";

export interface EliteCounterProps {
    current: number;
    total: number;
    lang: Language | undefined;
}

/**
 * Elite Counter Display Component
 * Shows current/total elite enemy count during runs
 */
export function EliteCounter({ current, total, lang }: EliteCounterProps) {
    const counterLabel = resolve(Label.EliteCounter, lang);
    const unitLabel = resolve(Label.EliteUnitCount, lang);

    return (
        <div className={classes.eliteCounter}>
            <div className={classes.label}>{counterLabel}</div>
            <div className={classes.count}>
                <span className={classes.current}>{current}</span>
                <span className={classes.separator}>/</span>
                <span className={classes.total}>{total}</span>
                <span className={classes.unit}>{unitLabel}</span>
            </div>
        </div>
    );
}
