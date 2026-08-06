const houses = ['cruzeiro','amendoeira','areia','pescador','mirante','estrela','corais'];

(async () => {
  for (const h of houses) {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/rooms/${h}`);
      const data = await res.json();
      const available = (data || []).filter(r => (r.guestIds || []).length < 2).length;
      console.log(`${h}: rooms=${(data||[]).length} available=${available}`);
    } catch (err) {
      console.log(`${h}: ERROR ${err.message}`);
    }
  }
})();
