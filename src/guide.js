import React, {
    Component
} from 'react';
export class BattGuide extends Component {
    render() {
        return (
            <div id="batt-guide">
                <h1>Battleline Quick Guide</h1>
                <p>This is just a quick guide for those who have played the game before if you have not I suggest you buy the game as it is more fun in the real world.</p>
                <p>The game is played with two decks the troop deck and the tactic deck. The troop deck contains 60 troops cards of 6 colors and value from 1-10. The tactic deck contains 10 tactic cards.</p>
                <p>The object of the game is to claim 5 of the 9 flags or 3 flags in a row. Flags can be claimed in the beginning of the turn and a flag can be claimed if the formation cannot be beat.</p>
                <p>The player must play a card troop or tactic when it is possible to play a troop card if it is not possible to play a troop card the player can choose if she wants to play a tactic card.</p>
                <h2 id="formation">Formation</h2>
                <p>A formation consists of 3 cards and the formations in order of strenght are:</p>
                <ul>
                    <li><p><strong>Wedge</strong> 3 troops where the values are in row and all troops have the same color like 2 green, 3 green, 4 green or 10 green, 8 green, 9 green. The order does not matter.</p></li>
                    <li><p><strong>Phalanx</strong> 3 troops with the same value. 3 green, 3 yellow, 3 blue.</p></li>
                    <li><p><strong>Battalion Order</strong> 3 troops with the same colors like 10 red, 6 red, 9 red.</p></li>
                    <li><p><strong>Skirmish Line</strong> 3 troops where the values are in a rows like 10 purpel, 9 red, 8 orange or 10 purpel, 8 orange, 9 red.</p></li>
                    <li><p><strong>Host</strong> 3 troops like 10 red, 9 red, 4 blue.</p></li>
                </ul>
                <p>When two players have the same formation the tiebreaker is the sum of the values called the strenght of the formation.</p>
                <p>Only unplayed troops can be used to argument against a claim of a flag. Tactic does not count and cards on the hand does not count.</p>
                <h2 id="tactic-cards">Tactic cards</h2>
                <p>The use of tactic cards is restricted to one more than the opponent.</p>
                <h3 id="morale-tactic-cards">Morale tactic cards</h3>
                <p>The morale tactics cards are played on a flag instead of a troops and can take different values and colors. They are jokers. The value and color are determined when the formation are used not when the card are played. The cards are:</p>
                <ul>
                    <li><p><strong>Darius</strong> a leader can take any value and color but a player can only play one leader per game.</p></li>
                    <li><p><strong>Alexander</strong> a leader can take any value and color but a player can only play one leader per game.</p></li>
                    <li><p><strong>8</strong> can take any color and the value is always 8.</p></li>
                    <li><p><strong>123</strong> can take any color and one of the values 1, 2, 3.</p></li>
                </ul>
                <h3 id="enviroment-tactic-cards">Enviroment tactic cards</h3>
                <p>Enviroment tatic cards are played below a flag and change the rules of the formations on the flag.</p>
                <ul>
                    <li><p><strong>Fog</strong> all formations are equal only the strenght of the formation count.</p></li>
                    <li><p><strong>Mud</strong> the formations must contain 4 cards.</p></li>
                </ul>
                <h3 id="guile-tactic-cards">Guile tactic cards</h3>
                <p>The guile cards are special moves.</p>
                <ul>
                    <li><p><strong>Scout</strong> The player draws 3 cards and return 2 cards the cards can be drawn from any decks and return to any decks. For example a player can draw 3 troops and return 2 tactic cards. The card can be played even if 3 cards does not remain in the decks.</p></li>
                    <li><p><strong>Redeploy</strong> The player move one of his troops or tactic cards from any flag that have not been claimed to another flag or of the board. Click the reseved space below the deck for removed cards to make this move.</p></li>
                    <li><p><strong>Deserter</strong> The player can remove a troop or tactic cards from the oppent side of an unclaimed flag.</p></li>
                    <li><p><strong>Traitor</strong> The player can take a troop from an opponents unclaimed flag and play it on his side of any unclaimed flag.</p></li>
                </ul>
            </div>
        );
    }
}
