import * as dMoveType from './dmovetype.js';
export const PT_Card = 0;
export const PT_Cone = 1;

/**
 * loop loops through moves and filter moves based on first card index
 * and second card index second card is optional zero for not use.
 * @param {[GameMove]} moves : Moves to filter
 * @param {int} firstCardix : The card index to check on first card of a move.
 * @param {int} secondCardix : The card index to check on the second card of a move.
 * @param {function} f: the function to call if indexes match.
 */
function loop(moves, firstCardix, secondCardix, f) {
    if ((moves) && (moves.length > 0)) {
        for (let i = 0; i < moves.length; i++) {
            let legalMove = moves[i];
            if (legalMove.Moves) {
                let firstMove = legalMove.Moves[0];
                let secondMove = null;
                if (firstMove.Index === firstCardix) {
                    if (legalMove.Moves.length>1){
                        secondMove = legalMove.Moves[1];
                    }
                    if (secondCardix > 0) {
                        if (secondMove.Index === secondCardix) {
                            f(legalMove, firstMove, secondMove);
                        }
                    } else {
                        f(legalMove, firstMove, secondMove);
                    }
                }
            }
        }
    }
}
/**
 * findPosOnFirst finds all the new postions from the moves where the first card
 * match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique new positions.
 */
export function findPosOnFirst(moves, firstCardix) {
    let posSet = new Set();
    loop(moves, firstCardix, 0, function(legalMove, firstMove, secondMove) {
        posSet.add(firstMove.NewPos);
    });
    return [...posSet];
}
/**
 * findOldPosOnFirst finds all the old postions on the first card of a
 * move where the first card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique old positions.
 */
export function findOldPosOnFirst(moves, firstCardix) {
    let posSet = new Set();
    loop(moves, firstCardix, 0, function(legalMove, firstMove, secondMove) {
        posSet.add(firstMove.OldPos);
    });
    return [...posSet];
}
/**
 * findPosOnSecond finds all the postions on the second card of a move where the
 * first card and second card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @param {} secondCardix : Filter moves on this being
 * the second card of a move.
 * @returns {[int]}  unique new positions for the second card of a GameMove
 */
export function findPosOnSecond(moves, firstCardix, secondCardix) {
    let posSet = new Set();
    loop(moves, firstCardix, secondCardix, function(legalMove, firstMove,
        secondMove) {
        posSet.add(secondMove.NewPos);
    });
    return [...posSet];
}
/**
 * findOldPosOnSecond finds all the old postions on the second card
 * where the first card match.
 * @param {[GameMove]} moves : GameMoves to search.
 * @param {} firstCardix : Filter moves on this being
 * the first card of a move.
 * @returns {[int]}  unique old positions.
 */
export function findOldPosOnSecond(moves, firstCardix) {
    let posSet = new Set();
    loop(moves, firstCardix, 0, function(legalMove, firstMove, secondMove) {
        posSet.add(secondMove.OldPos);
    });
    return [...posSet];
}

/**
 * isDeck check if the moves are a deck moves.
 * WARNING this does not include scout.
 * @param {[GameMoves]} moves
 * @returns {bool} : true if first move is a move type deck.
 */
export function isDeck(moves) {
    if ((moves) && (moves.length > 0)) {
        let legalMove = moves[0];
        if (legalMove.MoveType===dMoveType.Deck ) {
                return true;
        }
    }
    return false;
}
/**
 * isScout23 check if the moves are scout 2 or scout 3
 * @param {[GameMoves]} moves
 * @returns {bool} : true if deck is changed in the moves.
 */
export function isScout23(moves) {
    if ((moves) && (moves.length > 0)) {
        let legalMove = moves[0];
        if (legalMove.MoveType===dMoveType.Scout2||legalMove.MoveType===dMoveType.Scout3 ) {
            return true;
        }
    }
    return false;
}

/**
 * Check the first Move of moves to see if it is first BoardMove is a cone move.
 * @param {[GameMoves]} moves
 * @returns {bool} true if cane move.
 */
export function isCone(moves) {
    let res = false;
    if ((moves) && (moves.length > 0)) {
        let legalMove = moves[0];
        if (legalMove.MoveType===dMoveType.Cone){
            res=true;
        }
    }
    return res;
}

export function mover(moves) {
    if (moves) {
        return moves[0].Mover;
    } else {
        return 2;
    }
}
export function findMove(moves, move) {
    let ix = -1;
    for (let i = 0; i < moves.length; i++) {
        if (isMoveEqual(move, moves[i])) {
            return ix;
        }
    }
    return ix;
}

function isMoveEqual(a, b) {
    if (a.Mover !== b.mover) {
        return false;
    }
    if (a.Moves.length !== b.Moves.length) {
        return false;
    }
    for (let i = 0; i < a.Moves.length; i++) {
        if (!isPieceMoveEqual(a.Moves[i], b.Moves[i])) {
            return false;
        }
    }
    return true;
}

function isPieceMoveEqual(a, b) {
    if (a.Type !== b.Type) {
        return false;
    }
    if (a.Index !== b.Index) {
        return false;
    }
    if (a.NewPos !== b.NewPos) {
        return false;
    }
    if (a.OldPOs !== b.OldPos) {
        return false;
    }
    return true;
}
export function findMovePosOnFirst(cardix, cardPos, moves) {
    let moveix = -1;
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (move.Moves) {
            let pbMove = move.Moves[0];
            if (pbMove.Index === cardix && pbMove.NewPos === cardPos) {
                moveix = i;
                break;
            }
        }
    }
    return moveix;
}
export function findMoveOldPosOnSecond(firstCardix, cardPos, moves) {
    let moveix = -1;
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (move.Moves && move.Moves.length===2) {
            let pbPos = move.Moves[1].OldPos;
            let pbFirstix = move.Moves[0].Index;
            if (pbFirstix === firstCardix && pbPos === cardPos) {
                moveix = i;
                break;
            }
        }
    }
    return moveix;
}
export function findMovePosOnSecond(firstCardix, secondCardix, cardPos, moves) {
    let moveix = -1;
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (move.Moves&& move.Moves.length===2) {
            let pbPos = move.Moves[1].NewPos;
            let pbFirstix = move.Moves[0].Index;
            let pbSecondix = move.Moves[1].Index;
            if (pbFirstix === firstCardix && pbSecondix === secondCardix &&
                pbPos === cardPos) {
                moveix = i;
                break;
            }
        }
    }
    return moveix;
}
export function findMoveCone(coneixs, moves) {
    let moveix = -1;
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (!move.Moves) {
            if (coneixs.length === 0) {
                moveix = i;
                break;
            }
        } else {
            let pbMoves = move.Moves;
            if (!pbMoves){
                pbMoves=[];
            }
            if (pbMoves.length === coneixs.length) {
                moveix = i;
                for (let j = 0; j < pbMoves.length; j++) {
                    if (pbMoves[j].Index !== coneixs[j]) {
                        moveix = -1;
                        break;
                    }
                }
                if (moveix !== -1) {
                    break;
                }
            }
        }
    }
    return moveix;
}
export function findMoveScoutReturn2Cards(firstCardix, secondCardix, moves) {
    let moveix = -1;
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (move.Moves && move.Moves.length===2) {
            let pbFirstix = move.Moves[0].Index;
            let pbSecondix = move.Moves[1].Index;
            if (pbFirstix === firstCardix && pbSecondix === secondCardix){
                moveix=i;
                break;
            }
        }
    }
    return moveix;
}
export function isScoutReturn(moves) {
    return (moves[0].MoveType===dMoveType.ScoutReturn);
}
