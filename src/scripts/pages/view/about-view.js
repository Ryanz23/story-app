export default class AboutView {
  render() {
    return `
      <section class="container" style="padding: 40px 20px;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h1 style="text-align: center; margin-bottom: 40px; font-size: 2.5rem;">Tentang StoryApp</h1>
          <div style="display: flex; gap: 40px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
              <img
                src="https://jetwingtravels.com/wp-content/uploads/2024/01/Plan-Your-Trip-Desktop.jpg"
                alt="Image Story"
                style="width: 100%; height: 100%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
              >
            </div>
            <div style="flex: 1; min-width: 300px; shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h3 style="color: #2c3e50; margin-bottom: 20px;">Platform Berbagi Cerita</h3>
                <p style="line-height: 1.6; margin-bottom: 20px;">
                  StoryApp adalah tempat untuk membagikan kisah hidup, pengalaman, dan inspirasi.
                  Kami yakin setiap cerita memiliki makna dan dapat memberikan semangat baru bagi orang lain
                </p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">Yuk Share Ceritamu!</h3>
                <p style="line-height: 1.6;">
                  Bergabunglah bersama kami dan ceritakan pengalaman unikmu. Setiap kisah dapat menjadi inspirasi untuk banyak orang. Tidak perlu menjadi penulis ahli, yang terpenting adalah kejujuran dan semangat untuk berbagi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}
