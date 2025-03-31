// theme.js
export const colors = {
    primary: '#004182',
    accent: '#30a14e',
    danger: '#ff4444',
    light: '#f3f2ef',
    dark: '#101010',
    white: '#ffffff',
    gray: '#ccc',
    muted: '#888',
  };
  
  export const commonStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.dark,
      padding: 24,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    buttonText: {
      color: colors.white,
      fontWeight: 'bold',
    },
    input: {
      borderColor: colors.gray,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      color: colors.white,
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      color: colors.white,
      textAlign: 'center',
      marginBottom: 20,
    },
  };
  