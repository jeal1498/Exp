import { StyleSheet } from '@react-pdf/renderer'

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#382f51',
    borderBottomWidth: 1,
    borderBottomColor: '#382f51',
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  value: {
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
