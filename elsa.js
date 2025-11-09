const cardPairs = [
    {
        id: "transaction",
        insightTitle: "Transaction Log ↔ Risk Scoring",
        insightText:
            "Fraud models thrive on behavioral history. You protect identity by sharing patterns instead of raw IDs.",
        insightImage: "assets/2025-11-08_03-45.png",
        cards: [
            {
                type: "data",
                title: "Transaction Log",
                meta: "Data",
                image: "assets/2025-11-08_03-45.png",
            },
            {
                type: "decision",
                title: "Risk Scoring",
                meta: "Decision",
                image: "assets/2025-11-08_03-45_1.png",
            },
        ],
    },
    {
        id: "consent",
        insightTitle: "Explicit Consent ↔ Revocable Opt-In",
        insightText:
            "Ethical AI starts with control. Always let people withdraw permission as easily as they gave it.",
        insightImage: "assets/2025-11-08_03-45_2.png",
        cards: [
            {
                type: "data",
                title: "Explicit Consent",
                meta: "Record",
                image: "assets/2025-11-08_03-45_2.png",
            },
            {
                type: "decision",
                title: "Revocable Opt-In",
                meta: "Principle",
                image: "assets/2025-11-08_03-46.png",
            },
        ],
    },
    {
        id: "anonym",
        insightTitle: "Anonymisation ↔ Identity-Free Sharing",
        insightText:
            "Strip identifiers before sharing. It keeps signals useful while shielding the individual.",
        insightImage: "assets/2025-11-08_03-46_1.png",
        cards: [
            {
                type: "data",
                title: "Anonymisation",
                meta: "Technique",
                image: "assets/2025-11-08_03-46_1.png",
            },
            {
                type: "decision",
                title: "Identity-Free Sharing",
                meta: "Practice",
                image: "assets/2025-11-08_03-46_2.png",
            },
        ],
    },
    {
        id: "audit",
        insightTitle: "Audit Trail ↔ Transparent Reporting",
        insightText:
            "Keep a verifiable trail whenever data moves. Transparency builds trust and keeps teams accountable.",
        insightImage: "assets/G4PkNQTXoAAK2XO.jpeg",
        cards: [
            {
                type: "data",
                title: "Audit Trail",
                meta: "Control",
                image: "assets/G4PkNQTXoAAK2XO.jpeg",
            },
            {
                type: "decision",
                title: "Transparent Reporting",
                meta: "Governance",
                image: "assets/Ggc-NB1W8AAqsYM.jpeg",
            },
        ],
    },
    {
        id: "guardian",
        insightTitle: "Privacy Audit ↔ Guardian Review",
        insightText:
            "Independent oversight helps Elsa validate that automated decisions stay fair and explainable.",
        insightImage: "assets/GnNOXcSa0AAx-cp.jpeg",
        cards: [
            {
                type: "data",
                title: "Privacy Audit",
                meta: "Oversight",
                image: "assets/GnNOXcSa0AAx-cp.jpeg",
            },
            {
                type: "decision",
                title: "Guardian Review",
                meta: "Action",
                image: "assets/Gw8omhxbEAAtBGd.png",
            },
        ],
    },
    {
        id: "handoff",
        insightTitle: "Human Handoff ↔ Explainable Outcome",
        insightText:
            "Routing complex cases to humans while logging the rationale keeps the customer journey transparent.",
        insightImage: "assets/Gw_2QrlbUAAUqGL.png",
        cards: [
            {
                type: "data",
                title: "Human Handoff",
                meta: "Workflow",
                image: "assets/Gw_2QrlbUAAUqGL.png",
            },
            {
                type: "decision",
                title: "Explainable Outcome",
                meta: "Experience",
                image: "assets/Goqd_gCWwAAQ8eI.jpeg",
            },
        ],
    },
];

const badges = [
    { threshold: 42, label: "Data Guardian" },
    { threshold: 26, label: "Trust Architect" },
    { threshold: 0, label: "Data Rookie" },
];

const elements = {
    start: document.getElementById("startGame"),
    reset: document.getElementById("resetGame"),
    moves: document.getElementById("moves"),
    matches: document.getElementById("matches"),
    timer: document.getElementById("timer"),
    badge: document.getElementById("badge"),
    grid: document.getElementById("cardGrid"),
    emptyState: document.getElementById("emptyState"),
    insightImage: document.getElementById("insightImage"),
    insightTitle: document.getElementById("insightTitle"),
    insightText: document.getElementById("insightText"),
    template: document.getElementById("card-template"),
};

let deck = [];
let flippedCards = [];
let lockBoard = false;
let moves = 0;
let matches = 0;
let timerInterval = null;
let secondsElapsed = 0;
let gameStarted = false;

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
};

const shuffle = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
};

const computeBadge = () => {
    const score = matches * 12 - moves * 2;
    const earned =
        badges.find((badge) => score >= badge.threshold) || badges[badges.length - 1];
    return earned.label;
};

const updateHud = () => {
    elements.moves.textContent = moves;
    elements.matches.textContent = `${matches} / ${cardPairs.length}`;
    elements.timer.textContent = formatTime(secondsElapsed);
    elements.badge.textContent = computeBadge();
};

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
};

const startTimer = () => {
    stopTimer();
    timerInterval = setInterval(() => {
        secondsElapsed += 1;
        elements.timer.textContent = formatTime(secondsElapsed);
    }, 1000);
};

const resetHud = () => {
    moves = 0;
    matches = 0;
    secondsElapsed = 0;
    updateHud();
};

const revealCard = (cardElement) => {
    cardElement.classList.add("card--flipped");
    cardElement.setAttribute("aria-pressed", "true");
};

const hideCard = (cardElement) => {
    cardElement.classList.remove("card--flipped");
    cardElement.setAttribute("aria-pressed", "false");
};

const lockMatchedCard = (cardElement) => {
    cardElement.classList.add("card--matched");
    cardElement.disabled = true;
};

const showInsight = (pairInfo) => {
    if (pairInfo.insightImage) {
        elements.insightImage.src = pairInfo.insightImage;
    }
    elements.insightTitle.textContent = pairInfo.insightTitle;
    elements.insightText.textContent = pairInfo.insightText;
};

const clearInsight = () => {
    elements.insightTitle.textContent = "Insight from Elsa";
    elements.insightText.textContent =
        "Match cards to unlock Elsa’s ethical tips.";
    elements.insightImage.src = "assets/Gw_2QrlbUAAUqGL.png";
};

const checkMatch = () => {
    if (flippedCards.length !== 2) {
        lockBoard = false;
        return;
    }
    const [first, second] = flippedCards;
    const firstPair = first.dataset.pair;
    const secondPair = second.dataset.pair;
    if (firstPair === secondPair && first.dataset.type !== second.dataset.type) {
        matches += 1;
        lockMatchedCard(first);
        lockMatchedCard(second);
        const info = cardPairs.find((item) => item.id === firstPair);
        if (info) {
            showInsight(info);
        }
        if (matches === cardPairs.length) {
            endGame();
        }
    } else {
        hideCard(first);
        hideCard(second);
    }
    flippedCards = [];
    lockBoard = false;
    updateHud();
};

const onCardClick = (event) => {
    if (!gameStarted) {
        return;
    }
    const button = event.currentTarget;
    if (lockBoard || button.classList.contains("card--flipped") || button.classList.contains("card--matched")) {
        return;
    }
    if (!timerInterval) {
        startTimer();
    }
    revealCard(button);
    flippedCards.push(button);
    if (flippedCards.length === 2) {
        lockBoard = true;
        moves += 1;
        setTimeout(checkMatch, 600);
    }
};

const endGame = () => {
    stopTimer();
    elements.insightTitle.textContent = "All Clear!";
    elements.insightText.textContent = `You solved all pairs in ${moves} moves over ${formatTime(
        secondsElapsed,
    )}.`;
    elements.badge.textContent = computeBadge();
};

const createDeck = () => {
    const expanded = cardPairs.flatMap((pair) =>
        pair.cards.map((card, index) => ({
            ...card,
            id: `${pair.id}-${index}`,
            pair: pair.id,
        })),
    );
    deck = shuffle(expanded);
};

const renderDeck = () => {
    elements.grid.innerHTML = "";
    deck.forEach((card) => {
        const cardNode = elements.template.content.firstElementChild.cloneNode(true);
        cardNode.dataset.pair = card.pair;
        cardNode.dataset.type = card.type;
        cardNode.dataset.cardId = card.id;
        const imageEl = cardNode.querySelector(".card__image");
        imageEl.src = card.image;
        imageEl.alt = `${card.title} card image`;
        cardNode.querySelector(".card__title").textContent = card.title;
        cardNode.querySelector(".card__meta").textContent = card.meta;
        cardNode.addEventListener("click", onCardClick);
        elements.grid.appendChild(cardNode);
    });
};

const startGame = () => {
    gameStarted = true;
    elements.emptyState.style.display = "none";
    resetHud();
    clearInsight();
    createDeck();
    renderDeck();
};

const resetGame = () => {
    stopTimer();
    gameStarted = false;
    flippedCards = [];
    lockBoard = false;
    elements.grid.innerHTML = "";
    elements.emptyState.style.display = "flex";
    clearInsight();
    resetHud();
};

elements.start.addEventListener("click", () => {
    if (!gameStarted) {
        startGame();
    }
});

elements.reset.addEventListener("click", resetGame);

window.addEventListener("beforeunload", stopTimer);

