import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getConnectedWallet, grantDoctorAccess, hasDoctorAccess, revokeDoctorAccess } from "../services/blockchain";

export default function ConsentPage() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [message, setMessage] = useState("");

  const patientAddress = getConnectedWallet();

  useEffect(() => {
    setLoading(false);
  }, []);

  const refreshConsentStatus = async targetDoctor => {
    if (!patientAddress || !ethers.isAddress(patientAddress) || !ethers.isAddress(targetDoctor)) {
      return;
    }
    const enabled = await hasDoctorAccess(patientAddress, targetDoctor);
    setConsents(prev => {
      const existing = prev.find(item => item.doctorAddress.toLowerCase() === targetDoctor.toLowerCase());
      if (existing) {
        return prev.map(item =>
          item.doctorAddress.toLowerCase() === targetDoctor.toLowerCase() ? { ...item, enabled } : item
        );
      }
      return [...prev, { doctorAddress: targetDoctor, enabled }];
    });
  };

  const onToggle = async consent => {
    const nextEnabled = !consent.enabled;
    try {
      if (nextEnabled) {
        await grantDoctorAccess(consent.doctorAddress);
      } else {
        await revokeDoctorAccess(consent.doctorAddress);
      }
      await refreshConsentStatus(consent.doctorAddress);
      setMessage(`Consent ${nextEnabled ? "granted" : "revoked"} on blockchain.`);
    } catch (error) {
      setMessage(`Transaction failed: ${error.message}`);
    }
  };

  const addDoctor = async () => {
    setMessage("");
    const normalized = doctorAddress.trim();
    if (!ethers.isAddress(normalized)) {
      setMessage("Enter a valid doctor wallet address.");
      return;
    }
    await refreshConsentStatus(normalized);
    setDoctorAddress("");
  };

  return (
    <section className="card">
      <h2 className="text-lg font-semibold mb-4">Consent Management</h2>
      <p className="text-sm text-gray-500 mb-3">Patient Wallet: {patientAddress || "Not connected"}</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className="input max-w-xl"
          onChange={event => setDoctorAddress(event.target.value)}
          placeholder="Doctor wallet address (0x...)"
          value={doctorAddress}
        />
        <button className="btn-secondary" onClick={addDoctor} type="button">
          Add Doctor
        </button>
      </div>

      {message && <p className="text-sm text-gray-600 mb-4">{message}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading consents...</p>
      ) : (
        <div className="space-y-3">
          {consents.map(consent => (
            <div className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4" key={consent.doctorAddress}>
              <div>
                <p className="font-medium text-gray-800">{consent.doctorAddress}</p>
                <p className="text-sm text-gray-500">Scope: All Records (on-chain)</p>
              </div>

              <button
                className={consent.enabled ? "btn-green" : "btn-secondary"}
                onClick={() => onToggle(consent)}
                type="button"
              >
                {consent.enabled ? "Consent Enabled" : "Consent Disabled"}
              </button>
            </div>
          ))}

          {!consents.length && <p className="text-sm text-gray-500">Add a doctor address to manage blockchain consent.</p>}
        </div>
      )}
    </section>
  );
}
