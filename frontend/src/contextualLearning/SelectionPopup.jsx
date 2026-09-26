import "./SelectionPopup.css";

function SelectionPopup({ position, onExplain }) {

    // Do not render the popup when there is no valid position
    if (!position) {
        return null;
    }

    return (
        <div
            className="selectionPopup"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
        >
            <button onClick={onExplain}>
                ✨ Explain this
            </button>
        </div>
    );
}

export default SelectionPopup;