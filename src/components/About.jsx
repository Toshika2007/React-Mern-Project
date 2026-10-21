import "../css/about.css";
import StatCard from "./StatCard";

function About() {

    return (

        <section className="about" id="about">

            <div className="about-left">

                <h2>About AI Legal Document Simplifier</h2>

                <p>
                    AI Legal Document Simplifier is an intelligent web application
                    that helps users understand complex legal documents using
                    Artificial Intelligence.
                </p>
                <p>
                    Users can upload contracts, receive AI-generated summaries,
                    identify risky clauses, and interact with an AI-powered
                    assistant to understand legal documents without requiring
                    legal expertise.

                </p>

            </div>

            <div className="about-right">

                <StatCard
                    icon="📄"
                    number="1000+"
                    title="Documents Analyzed"
                />

                <StatCard
                    icon="🤖"
                    number="AI"
                    title="Powered Analysis"
                />

                <StatCard
                    icon="⚡"
                    number="Instant"
                    title="Summaries"
                />

                <StatCard
                    icon="🔒"
                    number="100%"
                    title="Secure Processing"
                />
                <StatCard
                     icon="👨‍⚖️"
                     number="24/7"
                     title="AI Legal Assistance"
                     />

            </div>

        </section>

    );

}

export default About;