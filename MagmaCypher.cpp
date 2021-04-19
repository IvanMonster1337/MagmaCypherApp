#include <iostream>
#include <iomanip>
#include <napi.h>

using namespace std;
static unsigned char Pi[8][16] =
{
  {1,7,14,13,0,5,8,3,4,15,10,6,9,12,11,2},
  {8,14,2,5,6,9,1,12,15,4,11,0,13,10,3,7},
  {5,13,15,6,9,2,12,10,11,7,8,1,4,3,14,0},
  {7,15,5,10,8,1,6,13,0,9,3,14,11,4,2,12},
  {12,8,2,1,13,4,15,6,7,0,10,5,3,14,9,11},
  {11,3,5,8,2,15,10,13,14,1,7,4,12,9,6,0},
  {6,8,2,3,9,10,5,12,1,14,4,7,11,13,0,15},
  {12,4,6,2,10,5,11,9,14,8,13,7,0,3,15,1}
};

const short CYPHER_BLOCK_SIZE = 8;
const short BLOCK_SIZE = 4;

typedef uint8_t vect[BLOCK_SIZE];
typedef uint8_t cyphblck[CYPHER_BLOCK_SIZE];

const uint8_t key[32] = {
    12, 20, 24, 67,
    43, 25, 28, 37,
    121, 203, 204, 35,
    21, 144, 224, 167,
    102, 120, 124, 70,
    45, 87, 142, 98,
    36, 21, 28, 95,
    100, 200, 150, 50
};

vect iter_key[32];

void GOST_Magma_Expand_Key(const uint8_t* key)
{
    memcpy(iter_key[0], key, 4);
    memcpy(iter_key[1], key + 4, 4);
    memcpy(iter_key[2], key + 8, 4);
    memcpy(iter_key[3], key + 12, 4);
    memcpy(iter_key[4], key + 16, 4);
    memcpy(iter_key[5], key + 20, 4);
    memcpy(iter_key[6], key + 24, 4);
    memcpy(iter_key[7], key + 28, 4);
    memcpy(iter_key[8], key, 4);
    memcpy(iter_key[9], key + 4, 4);
    memcpy(iter_key[10], key + 8, 4);
    memcpy(iter_key[11], key + 12, 4);
    memcpy(iter_key[12], key + 16, 4);
    memcpy(iter_key[13], key + 20, 4);
    memcpy(iter_key[14], key + 24, 4);
    memcpy(iter_key[15], key + 28, 4);
    memcpy(iter_key[16], key, 4);
    memcpy(iter_key[17], key + 4, 4);
    memcpy(iter_key[18], key + 8, 4);
    memcpy(iter_key[19], key + 12, 4);
    memcpy(iter_key[20], key + 16, 4);
    memcpy(iter_key[21], key + 20, 4);
    memcpy(iter_key[22], key + 24, 4);
    memcpy(iter_key[23], key + 28, 4);
    memcpy(iter_key[24], key + 28, 4);
    memcpy(iter_key[25], key + 24, 4);
    memcpy(iter_key[26], key + 20, 4);
    memcpy(iter_key[27], key + 16, 4);
    memcpy(iter_key[28], key + 12, 4);
    memcpy(iter_key[29], key + 8, 4);
    memcpy(iter_key[30], key + 4, 4);
    memcpy(iter_key[31], key, 4);
}

static void GOST_Magma_Add(const uint8_t* a, const uint8_t* b, uint8_t* c)
{
    int i;
    for (i = 0; i < BLOCK_SIZE; i++)
        c[i] = a[i] ^ b[i];
}

static void GOST_Magma_Add_32(const uint8_t* a, const uint8_t* b, uint8_t* c)
{
    int i;
    unsigned int internal = 0;
    for (i = 3; i >= 0; i--)
    {
        internal = a[i] + b[i] + (internal >> 8);
        c[i] = internal & 0xff;
    }
}

static void GOST_Magma_T(const uint8_t* in_data, uint8_t* out_data)
{
    uint8_t first_part_byte, sec_part_byte;
    int i;
    for (i = 0; i < 4; i++)
    {

        first_part_byte = (in_data[i] & 0xf0) >> 4;

        sec_part_byte = (in_data[i] & 0x0f);

        first_part_byte = Pi[i * 2][first_part_byte];
        sec_part_byte = Pi[i * 2 + 1][sec_part_byte];

        out_data[i] = (first_part_byte << 4) | sec_part_byte;
    }
}

static void GOST_Magma_g(const uint8_t* k, const uint8_t* a, uint8_t* out_data)
{
    uint8_t internal[4];
    uint32_t out_data_32;

    GOST_Magma_Add_32(a, k, internal);

    GOST_Magma_T(internal, internal);

    out_data_32 = internal[0];
    out_data_32 = (out_data_32 << 8) + internal[1];
    out_data_32 = (out_data_32 << 8) + internal[2];
    out_data_32 = (out_data_32 << 8) + internal[3];

    out_data_32 = (out_data_32 << 11) | (out_data_32 >> 21);

    out_data[3] = out_data_32;
    out_data[2] = out_data_32 >> 8;
    out_data[1] = out_data_32 >> 16;
    out_data[0] = out_data_32 >> 24;
}

static void GOST_Magma_G(const uint8_t* k, const uint8_t* a, uint8_t* out_data)
{
    uint8_t a_0[4];
    uint8_t a_1[4];
    uint8_t G[4];

    int i;

    for (i = 0; i < 4; i++)
    {
        a_0[i] = a[4 + i];
        a_1[i] = a[i];
    }

    GOST_Magma_g(k, a_0, G);

    GOST_Magma_Add(a_1, G, G);

    for (i = 0; i < 4; i++)
    {

        a_1[i] = a_0[i];

        a_0[i] = G[i];
    }

    for (i = 0; i < 4; i++)
    {
        out_data[i] = a_1[i];
        out_data[4 + i] = a_0[i];
    }
}

static void GOST_Magma_G_Fin(const uint8_t* k, const uint8_t* a, uint8_t* out_data)
{
    uint8_t a_0[4];
    uint8_t a_1[4]; 
    uint8_t G[4];

    int i;

    for (i = 0; i < 4; i++)
    {
        a_0[i] = a[4 + i];
        a_1[i] = a[i];
    }

    GOST_Magma_g(k, a_0, G);

    GOST_Magma_Add(a_1, G, G);

    for (i = 0; i < 4; i++)
        a_1[i] = G[i];

    for (i = 0; i < 4; i++)
    {
        out_data[i] = a_1[i];
        out_data[4 + i] = a_0[i];
    }
}

void GOST_Magma_Encrypt(const uint8_t* blk, uint8_t* out_blk)
{
    int i;
    GOST_Magma_G(iter_key[0], blk, out_blk);
    for (i = 1; i < 31; i++)
        GOST_Magma_G(iter_key[i], out_blk, out_blk);

    GOST_Magma_G_Fin(iter_key[31], out_blk, out_blk);
}

void GOST_Magma_Decrypt(const uint8_t* blk, uint8_t* out_blk)
{
    int i;
    GOST_Magma_G(iter_key[31], blk, out_blk);
    for (i = 30; i > 0; i--)
        GOST_Magma_G(iter_key[i], out_blk, out_blk);

    GOST_Magma_G_Fin(iter_key[0], out_blk, out_blk);
}

Napi::String Encrypt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1) {
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }

    if(!info[0].IsString()){
        Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }

    u16string message = info[0].As<Napi::String>().Utf16Value();
    u16string cypheredMessage = u16string();
    message += '\n';

    if(message.length() % 4 != 0){
        message += u16string(message.length() % 4, '0');
    }

    cypheredMessage.resize(message.length());

    cyphblck inblck;
    cyphblck outblck;
    int l = 0;

    GOST_Magma_Expand_Key(key);
    while(l < message.length()){
        memcpy(inblck, &message[l], 8);
        GOST_Magma_Encrypt(inblck, outblck);
        memcpy(&cypheredMessage[l], outblck, 8);
        l+=4;
    }

    Napi::String str = Napi::String::New(env, cypheredMessage);

    return str;
}

Napi::Object init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "encrypt"), Napi::Function::New(env, Encrypt));
    return exports;
};

NODE_API_MODULE(magma_cypher, init);