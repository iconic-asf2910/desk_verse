import { useState } from "react";

const Polls = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [votes, setVotes] = useState({
    optionA: 0,
    optionB: 0,
  });

  const handleVote = (option) => {
    if (selectedOption) {
      return;
    }

    setSelectedOption(option);

    setVotes((previousVotes) => ({
      ...previousVotes,
      [option]: previousVotes[option] + 1,
    }));
  };

  const totalVotes = votes.optionA + votes.optionB;

  const getPercentage = (votesCount) => {
    if (totalVotes === 0) {
      return 0;
    }

    return Math.round((votesCount / totalVotes) * 100);
  };

  return (
    <div>
      <h1>Polls</h1>

      <h2>Which time should we have the team meeting?</h2>

      <button
        type="button"
        onClick={() => handleVote("optionA")}
      >
        10:00 AM
      </button>

      <button
        type="button"
        onClick={() => handleVote("optionB")}
      >
        2:00 PM
      </button>

      <section>
        <p>10:00 AM — {getPercentage(votes.optionA)}%</p>
        <p>2:00 PM — {getPercentage(votes.optionB)}%</p>
      </section>
    </div>
  );
};

export default Polls;