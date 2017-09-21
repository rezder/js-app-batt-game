export const TCAlexander = 70;
export const TCDarius = 69;
export const TC8 = 68;
export const TC123 = 67;
export const TCFog = 66;
export const TCMud = 65;
export const TCScout = 64;
export const TCRedeploy = 63;
export const TCDeserter = 62;
export const TCTraitor = 61;
export const BACKTroop = 72;
export const BACKTac = 71;

/**
 * flagSort sorts cards in to groups envs and troops.
 * envs is environment cards and troops is troops and morale cards.
 * @param {[int]} cardixs
 * @returns {troops: {[int]},envs: {[int]}}
 */
export function flagSort(cardixs) {
    let troopixs = [];
    let envixs = [];
    if (cardixs) {
        for (let i = 0; i < cardixs.length; i++) {
            if (isEnv(cardixs[i])) {
                envixs.push(cardixs[i]);
            } else if (isTroop(cardixs[i]) || isMorale(cardixs[i])) {
                troopixs.push(cardixs[i]);
            }
        }
    }
    return {
        troops: troopixs,
        envs: envixs
    };
}
/**
 * dishSorts cards in troop and tactic cards.
 * @param {[int]} cardixs
 * @returns {troops {[int], tacs {[int]}}}
 */
export function dishSort(cardixs) {
    let troopixs = [];
    let tacixs = [];
    if (cardixs) {
        for (let i = 0; i < cardixs.length; i++) {
            if (isTac(cardixs[i])) {
                tacixs.push(cardixs[i]);
            } else if (isTroop(cardixs[i])) {
                troopixs.push(cardixs[i]);
            }
        }
    }
    return {
        troops: troopixs,
        tacs: tacixs
    };
}
export function isEnv(cardix) {
    return ((cardix === TCMud) || (cardix === TCFog));
}
export function isMorale(cardix) {
    return ((cardix === TCDarius) || (cardix === TCAlexander) || (cardix ===
        TC8) || cardix === TC123);
}
export function isGuile(cardix) {
    return ((cardix === TCScout) || (cardix === TCTraitor) || cardix ===
        TCDeserter) || (cardix === TCRedeploy);
}
export function isTac(cardix) {
    return ((cardix < 71) && (cardix > 60));
}
export function isTroop(cardix) {
    return ((cardix > 0) && (cardix < 61));
}
export function isBack(cardix) {
    return ((cardix === BACKTac) || (cardix === BACKTroop));
}
export function text(cardix) {
    if (isBack(cardix)) {
        if (cardix === BACKTac) {
            return "Tactic Card";
        } else {
            return "Troop Card";
        }
    } else if (isTac(cardix)) {
        return tacName(cardix);
    } else if (isTroop(cardix)) {
        let txt = colorName(cardix);
        txt = txt +" "+ troopStrenght(cardix);
        return txt;
    }
    return "Card not found!";
}
export function color(cardix) {
    var colors = ["#00ff00", "#ff0000", "#af3dff", "#ffff00", "#007fff",
        "#ffa500"
    ];
    return colors[Math.floor((cardix - 1) / 10)];
}

function colorName(cardix) {
    let colors = ["Green", "Red", "Purpel", "Yellow", "Blue", "Orange"];
    return colors[Math.floor((cardix - 1) / 10)];
}

export function troopStrenght(cardix) {

    var no = "" + cardix % 10;
    if (no === "0") {
        no = "10";
    }
    return no;
}

export function tacName(cardix) {
    let ix = cardix - 61;
    let names = ["Traitor", "Deserter", "Redeploy", "Scout", "Mud", "Fog",
        "123", "8", "Darius", "Alexander"
    ];

    return names[ix];
}

export function tacHint(cardix) {
    let ix = cardix - 61;
    let hints = [];
    hints.push(
        "Take a troop from an opponents unclaimed flags and play it.");
    hints.push(
        "Remove any opponent troop or tactic card from an unclaimed flag"
    );
    hints.push(
        "Move a troop or tactic card from an unclaimed flag to another flag or off the board."
    );
    hints.push("Draw 3 cards any decks and return 2 cards any decks");
    hints.push("Formation is extended to 4 card.");
    hints.push("Flag is won by sum of strenght.");
    hints.push("Joker any color strenght 1, 2 or 3.");
    hints.push("Joker any color strenght 8.");
    hints.push(
        "Joker leader any color any strenght, Max one leader per player."
    );
    hints.push(
        "Joker leader any color any strenght, Max one leader per player."
    );

    return hints[ix];
}
