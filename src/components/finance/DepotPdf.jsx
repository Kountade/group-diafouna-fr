import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image } from '@react-pdf/renderer';
import AxiosInstance from '../AxiosInstance';
import { Loader2, AlertCircle } from 'lucide-react';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 10
  },
  logo: {
    width: 100,
    height: 'auto'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c7a4b'
  },
  section: {
    marginBottom: 15
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 10,
    color: '#555'
  },
  value: {
    marginBottom: 8,
    fontSize: 12
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c7a4b',
    marginVertical: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#888',
    borderTop: 1,
    borderTopColor: '#ccc',
    paddingTop: 10
  }
});

// Composant PDF
const DepositReceipt = ({ transaction }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>EBSF Finance</Text>
        <Text>Reçu de dépôt</Text>
      </View>
      <Text style={styles.title}>CONFIRMATION DE DÉPÔT</Text>

      <View style={styles.section}>
        <Text style={styles.label}>N° de transaction</Text>
        <Text style={styles.value}>#{transaction.id}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Partenaire</Text>
        <Text style={styles.value}>{transaction.partner_name || transaction.to_account?.partner?.name || '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{new Date(transaction.created_at).toLocaleString('fr-FR')}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Montant versé</Text>
        <Text style={styles.amount}>
          {new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(transaction.amount)} €
        </Text>
      </View>
      {transaction.description && (
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{transaction.description}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.label}>Enregistré par</Text>
        <Text style={styles.value}>{transaction.created_by_email || 'Administrateur'}</Text>
      </View>
      <Text style={styles.footer}>
        Ce document fait foi d’un reçu de dépôt. Merci de conserver ce justificatif.
      </Text>
    </Page>
  </Document>
);

const DepotPdf = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const res = await AxiosInstance.get(`/transactions/${id}/`);
        if (res.data.transaction_type !== 'deposit') throw new Error('Non valide');
        setTransaction(res.data);
      } catch (err) {
        setError('Impossible de charger le dépôt');
      } finally {
        setLoading(false);
      }
    };
    fetchDeposit();
  }, [id]);

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
        <button onClick={() => navigate('/depots')} className="btn btn-primary mt-4">Retour</button>
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