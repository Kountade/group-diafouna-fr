import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c7a4b',
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoBlock: {
    marginVertical: 10,
    border: '1px solid #dcdcdc',
    backgroundColor: '#f9f9f9',
    padding: 10,
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
  table: {
    marginVertical: 10,
    border: '1px solid #dcdcdc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eaeaea',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottom: '1px solid #bdc3c7',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: '1px solid #eaeaea',
  },
  tableCell: {
    fontSize: 8,
    color: '#2c3e50',
    flex: 1,
  },
  amountPositive: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  amountNegative: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  summary: {
    marginTop: 15,
    padding: 10,
    border: '1px solid #2c7a4b',
    backgroundColor: '#eafaf1',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
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

const PartenairePDF = ({ partner, account, deposits, withdrawals, dateFrom, dateTo, companyInfo }) => {
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

  const formatNumber = (n) => {
    const num = parseFloat(n) || 0;
    const rounded = Math.round(num);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const totalDeposits = deposits.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const balance = parseFloat(account?.balance || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{defaultCompany.name}</Text>
            <Text style={styles.companyDetails}>{defaultCompany.address}</Text>
            <Text style={styles.companyDetails}>Tél: {defaultCompany.phone} | Email: {defaultCompany.email}</Text>
            <Text style={styles.companyDetails}>RCCM: {defaultCompany.rccm} | ID.NAT: {defaultCompany.idNat} | NIF: {defaultCompany.nif}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Rapport partenaire</Text>
            <Text style={{ fontSize: 8, color: '#7f8c8d' }}>N° {partner.id}</Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.title}>RAPPORT D'ACTIVITÉ DU PARTENAIRE</Text>
        <Text style={styles.subtitle}>
          Période du {dateFrom ? formatDate(dateFrom) : 'Début'} au {dateTo ? formatDate(dateTo) : 'Aujourd\'hui'}
        </Text>

        {/* Informations du partenaire */}
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Partenaire</Text>
            <Text style={styles.infoValue}>{partner.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{partner.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{partner.phone || 'Non renseigné'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adresse</Text>
            <Text style={styles.infoValue}>{partner.address || 'Non renseignée'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Solde actuel</Text>
            <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#2c7a4b' }]}>
              {formatNumber(balance)} GNF
            </Text>
          </View>
        </View>

        {/* Tableau des dépôts */}
        {deposits.length > 0 && (
          <>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#27ae60', marginTop: 10 }}>
              Dépôts ({deposits.length})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Description</Text>
                <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Montant</Text>
              </View>
              {deposits.map((tx) => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(tx.created_at)}</Text>
                  <Text style={styles.tableCell}>{tx.description || '—'}</Text>
                  <Text style={[styles.tableCell, styles.amountPositive, { textAlign: 'right' }]}>
                    + {formatNumber(tx.amount)} GNF
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, { backgroundColor: '#f0faf0', fontWeight: 'bold' }]}>
                <Text style={styles.tableCell}>Total</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={[styles.tableCell, styles.amountPositive, { textAlign: 'right' }]}>
                  + {formatNumber(totalDeposits)} GNF
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Tableau des retraits */}
        {withdrawals.length > 0 && (
          <>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#e74c3c', marginTop: 10 }}>
              Retraits ({withdrawals.length})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Date</Text>
                <Text style={styles.tableHeaderCell}>Description</Text>
                <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Montant</Text>
              </View>
              {withdrawals.map((tx) => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(tx.created_at)}</Text>
                  <Text style={styles.tableCell}>{tx.description || '—'}</Text>
                  <Text style={[styles.tableCell, styles.amountNegative, { textAlign: 'right' }]}>
                    - {formatNumber(tx.amount)} GNF
                  </Text>
                </View>
              ))}
              <View style={[styles.tableRow, { backgroundColor: '#faf0f0', fontWeight: 'bold' }]}>
                <Text style={styles.tableCell}>Total</Text>
                <Text style={styles.tableCell}></Text>
                <Text style={[styles.tableCell, styles.amountNegative, { textAlign: 'right' }]}>
                  - {formatNumber(totalWithdrawals)} GNF
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Résumé */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total dépôts</Text>
            <Text style={[styles.summaryValue, { color: '#27ae60' }]}>+ {formatNumber(totalDeposits)} GNF</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total retraits</Text>
            <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>- {formatNumber(totalWithdrawals)} GNF</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Solde actuel</Text>
            <Text style={[styles.summaryValue, { color: '#2c7a4b' }]}>{formatNumber(balance)} GNF</Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {defaultCompany.name} – {defaultCompany.address}
          </Text>
          <Text style={styles.footerText}>
            Tél: {defaultCompany.phone} | Email: {defaultCompany.email}
          </Text>
          <Text style={[styles.footerText, { marginTop: 2, fontSize: 6 }]}>
            Document généré le {new Date().toLocaleString('fr-FR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PartenairePDF;