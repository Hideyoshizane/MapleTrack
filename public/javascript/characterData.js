function getRank(characterData) {
    const { level, code } = characterData;
  
    if (code === 'zero') {
      if (level >= 130 && level <= 159) return 'b';
      if (level >= 160 && level <= 179) return 'a';
      if (level >= 180 && level <= 199) return 's';
      if (level >= 200 && level <= 249) return 'ss';
      if (level >= 250) return 'sss';
    } else {
      if (level >= 60 && level <= 99) return 'b';
      if (level >= 100 && level <= 139) return 'a';
      if (level >= 140 && level <= 199) return 's';
      if (level >= 200 && level <= 249) return 'ss';
      if (level >= 250) return 'sss';
    }
  
    return 'no_rank';
  }
