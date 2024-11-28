import "./styles.css";

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  customerId: string;
  origin: string;
  destination: string;
  onCustomerIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOriginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDestinationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Form({
  onSubmit,
  customerId,
  origin,
  destination,
  onCustomerIdChange,
  onOriginChange,
  onDestinationChange,
}: FormProps) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <label htmlFor="id_user">Id do usuário</label>
      <input
        type="text"
        id="id_user"
        name="id_user"
        value={customerId}  // Vincula o estado ao campo
        onChange={onCustomerIdChange}  // Atualiza o estado quando o usuário digita
      />
      <label htmlFor="origin">Endereço de origem</label>
      <input
        type="text"
        id="origin"
        name="origin"
        value={origin}  // Vincula o estado ao campo
        onChange={onOriginChange}  // Atualiza o estado quando o usuário digita
      />
      <label htmlFor="destination">Endereço de destino</label>
      <input
        type="text"
        id="destination"
        name="destination"
        value={destination}  // Vincula o estado ao campo
        onChange={onDestinationChange}  // Atualiza o estado quando o usuário digita
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
