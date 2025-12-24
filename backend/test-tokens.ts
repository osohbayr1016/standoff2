const standoff2Id = "53898875";
const expectedNickname = "Twissu";

async function testUserTokens() {
    const api = "https://store.standoff2.com/api";
    const response = await fetch(`${api}/v2/accounts`, {
        method: "POST",
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
            "Origin": "https://store.standoff2.com",
            "Referer": "https://store.standoff2.com/ru-RU",
            "Cookie": "Exp_NewStore_v24=Option_B; Exp_System_v5=Option_A; Exp_System_v6=Option_A; traceID=1d505d2a-3c21-4580-9cb9-6cec6c42fce0; _ga=GA1.1.1998950661.1766579857; _ym_uid=1766579857431651505; _ym_d=1766579857; _ym_isad=2; _ymab_param=f5mxPga2GkNpvk9hTMv3AB300Wy6wyJMrdx9fjCgSUfjbMD9KrXoR_ov7PUR_RZcK4g5oC7kQWzW_2n0pjFk0XSX-Yk; _ym_visorc=b; _ga_2BNLS3TTRN=GS2.1.s1766582379$o2$g1$t1766584234$j27$l0$h0",
            "rctoken": "0cAFcWeA62fnY1uzsjlz8qW9laRJ-IXrUaL2iRx5w-86I6DlfBxo_btwwAVUZPUW_45wzui6DGRoTw-EkFASarsPTS2tJNvNuTHK72TW1xIG0RqGIPtfA3d5FYOcojJ0oO4TLZleVSOjkOAMpVkTIN6Ib2A7gWOCoiOPt9twp-GgAnh_FMuB7y5HP532To17E--8Bx8RfduGd6ShAW7qkfdmDZ45rIDXw6xGMnm1N9fKU6-Urw3OpfpTOJwmdT66l5MFRSE_JXan_D5kiWCIhcTyt2SIpyFa1FmLmfUClnWQ1_7eR-yknnmTJobuXIepotWXMtqPqSDGyU1PI-rPLuU3_z_9M6j3ZDBdV28KIwk4rXth7IyhHCVyZ9ZbhSZLQNpFZrJcXZa0tMnBRNLZW9qdHs_9XMb7e09lbRTneHQCdYrGi0YgN6f2-UNAbLW-Zd-XlTavLok9kPe078Tn2IBLUJ9zzkCmHsWZN0lCmYy3b9EeiBDCJ_qkJEON_gdujcDdy0cy-uAdJV9KBy0VB6m2-LXm7pCNfOmjjwSDaxAEGUiUIKE2d8Fj_ic0FD2rM8nXqSuroYiBjAbLOcBN24YG1qHDMAZerF3Ar_WoVvIOwoCAG4ADcZi1XsajlCVV01z0yVdC4qNLSljTFLrhqhWoeEw6fwpmXgQyNwFK9W4Qq-DTA8UcU2Dz0TgOMS3DxNByfL0Y-RNcadU4R8Bku7z3cJjIZUOAbNZpkLiMZnmeLU6c5ptn097zYSx54vkH54UcZRMlAyATDUnfTYgUf6bwJBY_DmbI7PY0QanJcCrKU1zhcvGgDBhNxaVhdzYIGz3fJzp0pg7sgWaQI-qtta2jG-jkvtABt1P-AqESJBIIvrOE1ljz9DiZ44CXp3oWe_T1MxNK9PNtCvEUCTOLOuHtcwUU1C_C4KLEBW2StMTEpC1fTGwHNJFCUhaZGYEfyw4YA3ch4v9h7wIYhFu0nKG1yXQu3FAaEP_IIuOEqx1UfTZnmFqd-xjyM400g9WfS_M1U3KtEPcXV4uj13ajWWQjNTh4e3ugn0gFIl1JYa5iyvWYK5o-pFJK0I7HqASjJJVqLcSefGTpNV8zWJePoYxyeDFAOGEBjOTgu4tWqTkxMVFU1e4Ej1UMjr9fSkx5S6d8eaWRRZezmAA8Y8bieRE_0RHfU5wj_7co6VV-ST3pqtOsMMhb5erBL_62GVJjcxUN1pLb13IJ1cE6ZMm23oZWhIvP2NM9NHeNdNBBbnXmSw00YYGAC-UnFTwLyaD587_i-EjG69SCZrRr008JrNlvPhxUHPSw5Kg92md3y95pXrMIYmwjz1SmNg7gwY_o9XyeIw60lHeGNx5Lz7jTyCwNqRWXF6dMh4J3dbUi4T2PYq8x7SrULV05MuMhaU7xaz4c1ErJx3WQK749fRriUaB3HXATbA64PhKWAcCeiVXSPIyj0pHXqCSG-FD67fjYfJJLvGzhX-XqhQzxVYjrAlzSJbTTnkrASVe8dH_0tFdiWzeNrV9h99OzNWBQT73cjcNR2_t2Zs0aKRf9hTYVvjixtzXL2_-wywsW630txD5pOYFvAS2WxCi6MsUZ9sb-33MYe8PPzHMJX9spWavhdQYtnBi4hpmMoSU4DFn4Ho0jr3pgEz8eZjGLw"
        },
        body: JSON.stringify({ uid: Number(standoff2Id) })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
}

testUserTokens().catch(console.error);
