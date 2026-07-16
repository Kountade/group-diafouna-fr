import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import AxiosInstance from '../AxiosInstance';
import { Loader2, AlertCircle } from 'lucide-react';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #cccccc',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 'auto',
    marginRight: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  companyDetails: {
    fontSize: 8,
    color: '#7f8c8d',
    marginTop: 2,
  },
  headerRight: {
    textAlign: 'right',
    fontSize: 10,
    color: '#2c3e50',
  },
  titleContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c7a4b',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
  },
  infoBlock: {
    marginVertical: 10,
    border: '1px solid #dcdcdc',
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2c3e50',
    backgroundColor: '#eaeaea',
    padding: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#34495e',
    width: '30%',
  },
  infoValue: {
    fontSize: 9,
    color: '#2c3e50',
    width: '70%',
  },
  amountBlock: {
    marginVertical: 12,
    padding: 10,
    border: '1px solid #2c7a4b',
    backgroundColor: '#eafaf1',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    color: '#2c7a4b',
    fontWeight: 'bold',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a5e3a',
    marginTop: 4,
  },
  amountInWords: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#7f8c8d',
    marginVertical: 8,
    textAlign: 'center',
  },
  signatures: {
    marginTop: 20,
    borderTop: '1px solid #bdc3c7',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
    backgroundColor: '#ecf0f1',
    padding: 4,
    textAlign: 'center',
  },
  signatureContent: {
    fontSize: 7,
    color: '#34495e',
    marginTop: 6,
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #bdc3c7',
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

const DepositReceipt = ({ transaction, companyInfo }) => {
  // Informations de l'entreprise : Group Diafouna (Guinée)
  const defaultCompany = {
    name: 'Group Diafouna',
    address: 'Quartier Kipé, Conakry, Guinée',
    phone: '+224 622 111 222',
    email: 'contact@groupdiafouna.com',
    rccm: 'GN/CKY/RCCM/23-B-04567',
    idNat: 'GN-987654-ZYX',
    nif: 'B987654G',
    ...companyInfo,
  };

  // Formatage des nombres avec espace comme séparateur de milliers
  const formatNumber = (n) => {
    const num = parseFloat(n) || 0;
    const rounded = Math.round(num); // Pas de décimales pour le GNF
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const numberToWords = (amount) => {
    const num = parseFloat(amount) || 0;
    if (num === 0) return 'ZÉRO FRANCS GUINÉENS';
    return `${formatNumber(num)} FRANCS GUINÉENS (GNF)`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== EN-TÊTE ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo optionnel : <Image src={logo} style={styles.logo} /> */}
            <View>
              <Text style={styles.companyName}>{defaultCompany.name}</Text>
              <Text style={styles.companyDetails}>{defaultCompany.address}</Text>
              <Text style={styles.companyDetails}>Tél: {defaultCompany.phone} | Email: {defaultCompany.email}</Text>
              <Text style={styles.companyDetails}>RCCM: {defaultCompany.rccm} | ID.NAT: {defaultCompany.idNat} | NIF: {defaultCompany.nif}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Reçu de dépôt</Text>
            <Text style={{ fontSize: 8, color: '#7f8c8d' }}>N° {transaction.id}</Text>
          </View>
        </View>

        {/* ===== TITRE ===== */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>CONFIRMATION DE DÉPÔT</Text>
          <Text style={styles.subtitle}>
            Date: {new Date(transaction.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* ===== INFORMATIONS DU DÉPÔT ===== */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>INFORMATIONS DU DÉPÔT</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° Transaction</Text>
            <Text style={styles.infoValue}>#{transaction.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Partenaire</Text>
            <Text style={styles.infoValue}>{transaction.partner_name || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date de saisie</Text>
            <Text style={styles.infoValue}>{new Date(transaction.created_at).toLocaleString('fr-FR')}</Text>
          </View>
          {transaction.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{transaction.description}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Enregistré par</Text>
            <Text style={styles.infoValue}>{transaction.created_by_email || 'Administrateur'}</Text>
          </View>
        </View>

        {/* ===== MONTANT ===== */}
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Montant versé</Text>
          <Text style={styles.amountValue}>{formatNumber(transaction.amount)} GNF</Text>
        </View>

        {/* ===== MONTANT EN LETTRES ===== */}
        <Text style={styles.amountInWords}>
          Soit {numberToWords(transaction.amount)}
        </Text>

        {/* ===== SIGNATURES ===== */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>SIGNATURE DU PARTENAIRE</Text>
            <View style={styles.signatureContent}>
              <Text>Nom: _________________________</Text>
              <Text>Date: _________________________</Text>
              <Text>Signature: ____________________</Text>
            </View>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>SIGNATURE DE L'AGENT</Text>
            <View style={styles.signatureContent}>
              <Text>Nom: {transaction.created_by_email || '_____________'}</Text>
              <Text>Date: _________________________</Text>
              <Text>Signature et cachet: ___________</Text>
            </View>
          </View>
        </View>

        {/* ===== PIED DE PAGE ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {defaultCompany.name} – {defaultCompany.address}
          </Text>
          <Text style={styles.footerText}>
            Tél: {defaultCompany.phone} | Email: {defaultCompany.email}
          </Text>
          <Text style={[styles.footerText, { marginTop: 2, fontSize: 6 }]}>
            Ce document fait foi de reçu de dépôt en Francs Guinéens (GNF). Merci de conserver ce justificatif.
          </Text>
          <Text style={[styles.footerText, { marginTop: 2, fontSize: 5, color: '#b0b0b0' }]}>
            Document généré le {new Date().toLocaleString('fr-FR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Composant principal (avec PDFViewer)
const DepotPdf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const response = await AxiosInstance.get('/transactions/?type=deposit');
        const deposits = response.data || [];
        const found = deposits.find(t => t.id === parseInt(id));
        if (found) {
          setTransaction(found);
        } else {
          setError('Dépôt non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setError('Impossible de charger le dépôt');
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.transaction) {
      setTransaction(location.state.transaction);
      setLoading(false);
    } else {
      fetchDeposit();
    }
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-20 h-20 text-error mx-auto mb-4" />
        <p className="text-xl">{error || 'Dépôt non trouvé'}</p>
        <button onClick={() => navigate('/depots')} className="btn btn-primary mt-4">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Aperçu du reçu</h2>
        <button onClick={() => navigate(`/depots/${id}`)} className="btn btn-ghost btn-sm">
          Retour au détail
        </button>
      </div>
      <PDFViewer width="100%" height="100%" className="border rounded-lg">
        <DepositReceipt transaction={transaction} />
      </PDFViewer>
    </div>
  );
};

export default DepotPdf;