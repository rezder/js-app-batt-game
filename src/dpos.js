/**
 * @Position domain.
 * @name dpos.js
 */
export const card = {};
card.Players = [];
card.DeckTroop = 0;
card.Players[0] = {};
card.Players[1] = {};
card.Players[0].Flags = [];
card.Players[1].Flags = [];
for (let i = 0; i < 9; i++) {
    card.Players[0].Flags[i] = i + 1;
    card.Players[1].Flags[i] = i + 11;
}
card.Players[0].Dish = 10;
card.Players[1].Dish = 20;
card.Players[0].Hand = 21;
card.Players[1].Hand = 22;
card.DeckTac = 23;
card.Size = 24;
card.ScoutReturn=25;

card.text = function(posix) {
    if ((posix === card.DeckTroop) || (posix === card.DeckTac)) {
        return "Deck";
    } else {
        let playerix = player(posix);
        if (playerix === -1) {
            return "Position not found";
        } else {
            let txt = "Player";
            txt = txt + (playerix + 1)
                .toString();
            txt = txt + " ";
            if ((posix === card.Players[0].Dish) || (posix === card.Players[
                    1].Dish)) {
                txt = txt + "Dish";
            } else if ((posix === card.Players[0].Hand) || (posix === card.Players[
                    1].Hand)) {
                txt = txt + "Hand";
            } else {
                txt = txt + "Flag" + posix % 10;
            }
            return txt;
        }
    }
};

export const cone = {};
cone.None = 0;
cone.Player = [];
cone.Player[0] = 1;
cone.Player[1] = 2;
cone.text = function(posix) {
    if (posix === cone.None) {
        return "None";
    } else if ((posix === cone.Player[0] && posix === cone.Player[1])) {
        let txt = "Player" + posix;
        return txt;
    } else {
        return "No Cone postion found!";
    }
};

export const BPCone = 0;
export const BPCard = 1;
/**
 * Pointer points to a postion and a board piece.
 * @param {int} type : BPCone or BPCard
 * @param {int} pos : Postion 0-23 for Card and 0-2 for Cone
 * @param {int} ix : Cone index or Card index both starts a 1.
 */
export class Pointer {
    constructor(type, pos, ix) {
        this.type = type;
        this.pos = pos;
        this.ix = ix;
    }
    isEqual(p) {
        if (this.type === p.type &&
            this.pos === p.pos &&
            this.ix === p.ix) {
            return true;
        }
        return false;
    }
    /**
     * Card creates a card pointer.
     * @param {int} pos : Position 0-23.
     * @param {int} cardix : Card index 1-72.
     * @returns {Pointer} : Pointer.
     */
    static Card(pos, cardix) {
        return new Pointer(BPCard, pos, cardix);
    }
    /**
     *Cone creates a Cone pointer.
     * @param {int} pos : Position 0-2.
     * @param {int} coneix : Cone index 1-9;
     * @returns {Pointer} : Pointer.
     */
    static Cone(pos, coneix) {
        return new Pointer(BPCone, pos, coneix);
    }
}
/**
 *player returns the player from a card postion, -1 if not found.
 * @param {int} pos : The position
 * @returns {int} : player index.
 */
export function player(pos) {
    if (pos > 0 && pos < 11) {
        return 0;
    } else if (pos > 10 && pos < 21) {
        return 1;
    } else if (pos === 21) {
        return 0;
    } else if (pos === 22) {
        return 1;
    }
    return -1;
}
/**
 *pointerToCardixs  filters card pointer based on a postion.
 *returns cardixs only may be empty.
 * @param {int} pos : The position
 * @param {[Pointer]} pointers : The pointers to filter.
 * @returns {[int]} The cardixs.
 */
export function pointerToCardixs(pos, pointers) {
    let markedCardixs = [];
    if (pointers) {
        for (let i = 0; i < pointers.length; i++) {
            if (pointers[i].pos === pos) {
                markedCardixs.push(pointers[i].ix);
            }
        }
    }
    return markedCardixs;
}
