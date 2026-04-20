import '../styles/ServiceCard.css';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export const ServiceCard = ({ title, description, icon }: Props) => {
  return (
    <div className="service-card">
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="card-btn">Ingresar</button>
    </div>
  );
};