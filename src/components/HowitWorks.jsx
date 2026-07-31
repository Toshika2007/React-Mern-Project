import "../css/HowItWorks.css";

function HowItWorks() {

  const steps = [

    {
      number: "1",
      title: "Upload PDF",
      description: "Upload your legal document securely."
    },

    {
      number: "2",
      title: "AI Analysis",
      description: "AI reads and understands the document."
    },

    {
      number: "3",
      title: "Generate Summary",
      description: "Receive a simple summary instantly."
    },

    {
      number: "4",
      title: "Risk Detection",
      description: "Highlight risky legal clauses."
    },

    {
      number: "5",
      title: "AI Chat",
      description: "Ask questions about your document."
    }

  ];

  return (

    <section className="how-it-works" id="how">

      <h2>How It Works</h2>

      <p>
        Analyze your legal documents in just five simple steps.
      </p>

      <div className="steps">

        {

          steps.map((step)=>(
              
            <div className="step-card">

                <div className="step-number">
                    {step.number}
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>

            </div>

          ))

        }

      </div>

    </section>

  );

}

export default HowItWorks;