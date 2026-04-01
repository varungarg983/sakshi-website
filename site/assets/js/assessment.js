const form = document.getElementById('assessment-form');

if (form) {
  const resultCard = document.getElementById('result-card');
  const resultBadge = document.getElementById('result-badge');
  const scoreValue = document.getElementById('score-value');
  const scoreSummary = document.getElementById('score-summary');
  const resultTitle = document.getElementById('result-title');
  const resultBody = document.getElementById('result-body');
  const nextSteps = document.getElementById('next-steps');
  const yesCount = document.getElementById('yes-count');
  const partlyCount = document.getElementById('partly-count');
  const noCount = document.getElementById('no-count');
  const resetButton = document.getElementById('reset-button');

  const outcomes = {
    strong: {
      badge: 'Strong Position',
      badgeClass: 'good',
      summary: 'Your answers suggest the business is relatively well prepared in many of the areas buyers usually focus on.',
      title: 'You appear to be in a strong position to start planning a sale.',
      body: 'That does not guarantee an easy sale, but it suggests you may be ready for a conversation about timing, presentation, buyer fit, and sale strategy.',
      steps: [
        'Review how the business should be presented to buyers.',
        'Identify likely value drivers and any points that may still attract questions.',
        'Talk through timing and sale strategy with Sakshi via Clyth McLeod.'
      ]
    },
    moderate: {
      badge: 'Needs Tightening',
      badgeClass: 'mid',
      summary: 'There is something solid to work with, but a few weaker areas may affect buyer confidence.',
      title: 'You may be closer than you think, but some preparation would probably help.',
      body: 'A result in this range often means the business could still be saleable, but preparation around financials, operations, documentation, or owner dependence could improve the process.',
      steps: [
        'Identify the two or three issues most likely to concern a buyer.',
        'Tighten the numbers and operational information you would need to share.',
        'Discuss whether to prepare first or go to market sooner.'
      ]
    },
    early: {
      badge: 'Preparation Needed',
      badgeClass: 'low',
      summary: 'A buyer would probably see several areas of uncertainty or risk in the business as it stands today.',
      title: 'Your business may need more preparation before going to market.',
      body: 'That does not mean you cannot sell. It usually means the next step is to get clear on what should be improved first so the business is better positioned later.',
      steps: [
        'Focus first on the most important gaps in financial clarity, owner dependence, and documentation.',
        'Decide which improvements are realistic in the next 6 to 12 months.',
        'Use a confidential conversation to prioritise what matters most.'
      ]
    }
  };

  function getValue(name) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);
    return selected ? Number(selected.value) : null;
  }

  function setSteps(items) {
    nextSteps.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      nextSteps.appendChild(li);
    });
  }

  function clearResult() {
    resultCard.classList.add('hidden');
    resultBadge.classList.remove('good', 'mid', 'low');
    nextSteps.innerHTML = '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let total = 0;
    let yes = 0;
    let partly = 0;
    let no = 0;

    for (let index = 1; index <= 12; index += 1) {
      const value = getValue(`q${index}`);
      if (value === null) {
        window.alert('Please answer every question before calculating your result.');
        return;
      }

      total += value;
      if (value === 2) yes += 1;
      if (value === 1) partly += 1;
      if (value === 0) no += 1;
    }

    const outcome = total >= 18 ? outcomes.strong : total >= 10 ? outcomes.moderate : outcomes.early;

    resultBadge.classList.remove('good', 'mid', 'low');
    resultBadge.classList.add(outcome.badgeClass);
    resultBadge.textContent = outcome.badge;
    scoreValue.textContent = total;
    scoreSummary.textContent = outcome.summary;
    resultTitle.textContent = outcome.title;
    resultBody.textContent = outcome.body;
    yesCount.textContent = yes;
    partlyCount.textContent = partly;
    noCount.textContent = no;
    setSteps(outcome.steps);
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      form.reset();
      clearResult();
    });
  }
}
