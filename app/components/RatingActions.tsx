'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { Employee } from '../types'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
})

interface RatingActionsProps {
  employee: Employee
}

const RatingPDF = ({ employee }: RatingActionsProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Employee Rating</Text>
        <Text style={styles.text}>Name: {employee.name}</Text>
        <Text style={styles.text}>Hire Date: {employee.hireDate}</Text>
        <Text style={styles.text}>Qualification: {employee.qualification}</Text>
        <Text style={styles.text}>Sparte: {employee.sparte}</Text>
        {employee.evaluations && employee.evaluations.map((evaluation, index) => (
          <View key={index}>
            <Text style={styles.text}>Evaluation Date: {evaluation.date}</Text>
            <Text style={styles.text}>Total Score: {evaluation.totalScore}</Text>
            <Text style={styles.text}>Comment: {evaluation.comment}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

const RatingActions: React.FC<RatingActionsProps> = ({ employee }) => {
  return (
    <div>
      <PDFDownloadLink
        document={<RatingPDF employee={employee} />}
        fileName={`${employee.name}_rating.pdf`}
      >
        {({ blob, url, loading, error }) => 
          loading ? (
            <button className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed">
              Loading document...
            </button>
          ) : (
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Download PDF
            </button>
          )
        }
      </PDFDownloadLink>
    </div>
  )
}

export default RatingActions

