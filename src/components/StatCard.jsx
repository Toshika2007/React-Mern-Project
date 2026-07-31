import "../css/statcard.css";

function StatCard(props) {

    return (

        <div className="stat-card">

            <div className="stat-icon">
                {props.icon}
            </div>

            <h2>{props.number}</h2>

            <p>{props.title}</p>

        </div>

    );

}

export default StatCard;