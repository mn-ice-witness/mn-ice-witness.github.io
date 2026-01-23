# Google Analytics

Google Analytics tracking is currently disabled. To re-enable, add this code to the `<head>` of `docs/index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N0KGYZ7FQX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-N0KGYZ7FQX');
</script>
```

Property ID: `G-N0KGYZ7FQX`
